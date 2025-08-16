import pytest
from rest_framework.test import APIClient
from ..models import Block, Order


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
        defaults = {
            "code": kwargs.get("code"),
            "destination": kwargs.get("destination", "Av. Central"),
            "origin": kwargs.get("destination", "Warehouse"),
            "status": kwargs.get("status"),
            "latitude": kwargs.get("latitude", 10.123456),
            "longitude": kwargs.get("longitude", -84.987654),
            "block": block,
        }
        defaults.update(kwargs)
        return Order.objects.create(**defaults)
    return create_order
