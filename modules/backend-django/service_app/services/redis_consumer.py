import json
import os
import time
from typing import Any, Dict

import redis
from django.db import transaction

from ..models import Block, Driver, Order, Product

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
STREAM = os.getenv("REDIS_STREAM", "logistrack.bloques.ready")
GROUP = os.getenv("REDIS_GROUP", "block.distribution")
CONSUMER_NAME = os.getenv("REDIS_CONSUMER", "worker-1")


def ensure_group(r: redis.Redis):
    try:
        r.xgroup_create(STREAM, GROUP, id="$", mkstream=True)
        print(f"Created group {GROUP} on {STREAM}")
    except redis.ResponseError as e:
        if "BUSYGROUP" in str(e):
            pass
        else:
            raise


def handle_event(evt: Dict[str, Any]):
    event_id = evt.get("event_id")

    # if EventDedup.objects.filter(event_id=event_id).exists():
    #     return

    payload = evt.get("payload", {})
    block_id = payload.get("block_id")
    order_id = payload.get("order_id")
    driver_id = payload.get("driver_id")
    products = payload.get("products", [])
    dispatch_date = payload.get("dispatch_date")

    with transaction.atomic():
        # EventDedup.objects.create(event_id=event_id)

        # driver, _ = Driver.objects.get_or_create(id=driver_id)
        # block, _ = Block.objects.get_or_create(id=block_id)
        # order, _ = Order.objects.get_or_create(id=order_id)
        #
        # if order.block.id != block.id:
        #     order.block = bloque
        #     orden.save(update_fields=["bloque"])
        #
        # for p in productos:
        #     Producto.objects.create(
        #         orden=orden,
        #         sku=p.get("sku", ""),
        #         descripcion=p.get("descripcion", ""),
        #         peso=p.get("peso"),
        #         volumen=p.get("volumen"),
        #     )
        pass


def run():
    r = redis.from_url(REDIS_URL)
    ensure_group(r)
    block_ms = 5000

    while True:
        resp = r.xreadgroup(
            GROUP, CONSUMER_NAME, streams={STREAM: ">"}, count=10, block=block_ms
        )

        if not resp:
            continue

        for stream_name, messages in resp:
            for msg_id, fields in messages:
                try:
                    data = json.loads(fields.get(b"data", b"{}"))
                    handle_event(data)
                    r.xack(STREAM, GROUP, msg_id)
                except Exception as e:
                    print("Error processing", msg_id, e)
