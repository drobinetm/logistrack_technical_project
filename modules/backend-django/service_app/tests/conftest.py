import pytest
from rest_framework.test import APIClient
from ..models import Block, Order, Driver, Product
from django.utils import timezone


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def block_factory(db):
    def create_block(name="Block A", description="Test block"):
        return Block.objects.create(name=name, description=description)
    return create_block


@pytest.fixture
def order_factory(db, block_factory):
    def create_order(**kwargs):
        block = kwargs.get("block")
        driver = kwargs.get("driver", None)
        product = kwargs.get("product", None)

        defaults = {
            "code": kwargs.get("code"),
            "destination": kwargs.get("destination", "Av. Central"),
            "origin": kwargs.get("destination", "Warehouse"),
            "status": kwargs.get("status"),
            "latitude": kwargs.get("latitude", 10.123456),
            "longitude": kwargs.get("longitude", -84.987654),
            "dispatch_date": timezone.now(),
            "block": block,
        }

        if driver is not None:
            defaults["driver"] = driver

        if product is not None:
            defaults["product"] = product

        defaults.update(kwargs)
        return Order.objects.create(**defaults)
    return create_order


@pytest.fixture
def driver_factory(db):
    """Create a driver instance for testing."""
    def create_driver(
        first_name="Test",
        last_name="Driver",
        license_plate="ABC123",
    ):
        return Driver.objects.create(
            first_name=first_name,
            last_name=last_name,
            license_plate=license_plate,
            date_of_birth=timezone.now()
        )
    return create_driver


@pytest.fixture
def product_factory(db):
    """Create a product instance for testing."""
    def create_product(
        name="Test Product",
        sku="TEST123"
    ):
        return Product.objects.create(
            name=name,
            sku=sku
        )
    return create_product
