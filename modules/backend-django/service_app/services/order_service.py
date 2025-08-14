from datetime import datetime

from django.utils.timezone import make_aware

from ..dto.order_model_dto import OrderDTO
from ..helpers.dto_helper import order_to_dto
from ..helpers.number_helper import generate_random_code
from ..models import Block, Driver, OrderStatus, Product
from ..repositories.order_repository import OrderRepository


class OrderService:
    """
    Service class for handling order-related business logic.
    """

    def __init__(self, order_repository: OrderRepository = None):
        self.order_repository = order_repository or OrderRepository()

    def create_or_update_order(self, payload: dict) -> OrderDTO:
        """
        Create a new order with the provided payload.

        Args:
            payload: Dictionary containing order data with keys:
                - order_id: int
                - block_id: int
                - driver_id: int
                - products: List[int] (list of product IDs)
                - dispatch_date: str (format: 'YYYY-MM-DD HH:MM:SS')

        Returns:
            Tuple[bool, Union[OrderDTO, str]]:
                - First element indicates success (bool)
                - Second element contains OrderDTO on success or error message on failure
        """
        try:
            # Get or create related objects
            driver = self._get_or_create_driver(payload["driver_id"])
            block = self._get_or_create_block(payload["block_id"])
            products = self._get_or_create_products(payload["products"])

            # Parse dispatch_date to datetime
            dispatch_date = datetime.strptime(
                payload["dispatch_date"], "%Y-%m-%d %H:%M:%S"
            )

            # Create order data
            order_data = {
                "code": generate_random_code(),
                "driver": driver,
                "block": block,
                "status": OrderStatus.APPROVED,
                "dispatch_date": make_aware(dispatch_date),
                "origin": "Bodega Central",
                "destination": "Supermercado La Estrella",
                "user": "operador1",
                "latitude": "19.432608",
                "longitude": "-99.133209",
                "volume": "0.50",
                "weight": "30.00",
                "incidents": None,
                "number_of_bags": 2,
            }

            # Get or create order based on order_id
            order = self.order_repository.get_order_by_id(payload["order_id"])

            if order:
                order.driver = order_data["driver"]
                order.block = order_data["block"]
                order.status = order_data["status"]
                order.dispatch_date = order_data["dispatch_date"]
            else:
                order = self.order_repository.create_order(order_data)

            # Set products for the order and save
            order.products.set(products)
            order.save()

            return order_to_dto(order)
        except Exception as e:
            raise ValueError(f"Failed to create order: {str(e)}")

    @staticmethod
    def _get_or_create_driver(driver_id: int) -> Driver:
        """Get or create a driver with the given ID."""
        return Driver.objects.get_or_create(
            id=driver_id,
            defaults={
                "first_name": "Unknown",
                "last_name": "Driver",
                "license_plate": "UNKNOWN",
                "date_of_birth": "2000-01-01",
            },
        )[0]

    @staticmethod
    def _get_or_create_block(block_id: int) -> Block:
        """Get or create a block with the given ID."""
        return Block.objects.get_or_create(
            id=block_id,
            defaults={"name": f"Block-{block_id}", "description": "Auto-created block"},
        )[0]

    @staticmethod
    def _get_or_create_products(product_ids: list[int]) -> list[Product]:
        """Get or create products with the given IDs."""
        products = []

        for product_id in product_ids:
            product, _ = Product.objects.get_or_create(
                id=product_id,
                defaults={"name": f"Product-{product_id}", "sku": f"SKU-{product_id}"},
            )
            products.append(product)

        return products
