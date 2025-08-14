from typing import Optional

from django.db import transaction

from ..models import Order


class OrderRepository:
    """
    Repository class for handling Order model database operations.
    """

    @transaction.atomic
    def create_order(self, order_data: dict) -> Order:
        """
        Create a new order with the provided data.

        Args:
            order_data: Dictionary containing order data

        Returns:
            Order: The created Order instance
        """
        return Order.objects.create(**order_data)

    @staticmethod
    def get_order_by_id(order_id: int) -> Optional[Order]:
        """
        Retrieve an order by its ID.

        Args:
            order_id: The ID of the order to retrieve

        Returns:
            Optional[Order]: The Order instance if found, None otherwise
        """
        return Order.objects.get(id=order_id)
