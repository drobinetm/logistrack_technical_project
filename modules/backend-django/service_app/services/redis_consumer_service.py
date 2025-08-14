import json
import os
import re
from typing import Any, Dict

import redis
from django.db import transaction

from ..models import RedisOutbox
from ..tasks import dispatch_to_q
from .order_service import OrderService

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
STREAM = os.getenv("REDIS_STREAM", "events_stream")
GROUP = os.getenv("REDIS_GROUP", "main_group")
CONSUMER_NAME = os.getenv("REDIS_CONSUMER", "worker-1")

# Initialize services
order_service = OrderService()


def ensure_group(r: redis.Redis):
    try:
        r.xgroup_create(STREAM, GROUP, id="0", mkstream=True)
        print(f"Created group {GROUP} on {STREAM}")
    except redis.ResponseError as e:
        if "BUSYGROUP" not in str(e):
            raise


def handle_event(event_id: str, event_type: str, payload: dict) -> None:
    """
    Handle incoming events from Redis stream.

    Args:
        event_id: Unique identifier for the event
        event_type: Type of the event (e.g., 'order.created')
        payload: Event data
    """
    # Skip if we've already processed this event
    if RedisOutbox.objects.filter(event_id=event_id).exists():
        return

    try:
        with transaction.atomic():
            # Handle different event types
            _handle_order_data(payload)

            # Record the event in the outbox
            RedisOutbox.objects.create(
                event_id=event_id,
                event_type=event_type,
                payload=payload,
                received=True,
            )

            print(f"Processed event {event_id} of type {event_type}")
    except Exception as e:
        print(f"Error processing event {event_id}: {str(e)}")
        raise


def _handle_order_data(payload: Dict[str, Any]) -> None:
    required_fields = ["order_id", "block_id", "driver_id", "products", "dispatch_date"]

    # Validate payload
    if not all(field in payload for field in required_fields):
        missing = [f for f in required_fields if f not in payload]
        raise ValueError(f"Missing required fields in payload: {', '.join(missing)}")

    # Create order using the order service
    order = order_service.create_or_update_order(payload)

    if not order:
        raise ValueError(f"Failed to create order: {payload['order_id']}")

    print(f"Created order with ID {order.id}")


def run():
    r = redis.from_url(REDIS_URL)
    ensure_group(r)
    block_ms = 5000

    while True:
        try:
            resp = r.xreadgroup(
                GROUP, CONSUMER_NAME, streams={STREAM: ">"}, count=10, block=block_ms
            )

            if not resp:
                continue

            for stream_name, messages in resp:
                for msg_id, fields in messages:
                    try:
                        raw = fields[b"message"].decode("utf-8")

                        match = re.search(r's:\d+:"(.*)";', raw)
                        if not match:
                            continue

                        inner_json_str = match.group(1)
                        outer_json = json.loads(inner_json_str)
                        body_json = json.loads(outer_json["body"])

                        if not body_json:
                            continue

                        event_type = body_json.get(b"eventType") or body_json.get(
                            "eventType"
                        )
                        payload = body_json.get(b"payload") or body_json.get("payload")

                        if isinstance(event_type, bytes):
                            event_type = event_type.decode()

                        if isinstance(payload, bytes):
                            payload = json.loads(payload.decode())
                        elif isinstance(payload, str):
                            payload = json.loads(payload)

                        print(f"Processing event: {event_type}")
                        print(f"Payload: {payload}")

                        # Handle the event
                        handle_event(msg_id, event_type, payload)

                        # Send event to Django-Q for async processing
                        dispatch_to_q(msg_id, event_type, payload)

                        # Acknowledge the message
                        r.xack(STREAM, GROUP, msg_id)

                    except json.JSONDecodeError as e:
                        print(f"JSON decode error in message {msg_id}: {e}")
                    except Exception as e:
                        print(f"Error processing message {msg_id}: {e}")
        except Exception as e:
            print(f"Error in Redis consumer: {e}")
            import time

            time.sleep(5)  # Prevent tight loop on errors
