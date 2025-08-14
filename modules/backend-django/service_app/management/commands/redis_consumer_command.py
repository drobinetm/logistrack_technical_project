from django.core.management.base import BaseCommand

from ...services.redis_consumer_service import run


class Command(BaseCommand):
    help = "Run Redis Stream consumer with consumer group"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting Redis consumer..."))
        run()
