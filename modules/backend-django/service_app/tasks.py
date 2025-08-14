from django.db import IntegrityError, transaction
from django_q.tasks import async_task

from .models import RedisOutbox


def process_event_q(event_id: str, event_type: str, payload: dict):
    try:
        with transaction.atomic():
            obj, created = RedisOutbox.objects.get_or_create(
                event_id=event_id,
                defaults={
                    "event_type": event_type,
                    "payload": payload,
                    "received": True,
                },
            )

            if not created:
                return f"Q: Event {event_id} already exists"
    except IntegrityError:
        return f"Q: Event {event_id} race handled"
    return f"Q: Event {event_id} stored"


def dispatch_to_q(event_id, event_type, payload):
    async_task("service_app.tasks.process_event_q", event_id, event_type, payload)
