import pytest
from datetime import date, timedelta
from django.utils import timezone
from django.urls import reverse
from rest_framework import status

PREPARATION_URL = reverse("preparation-list")


@pytest.mark.django_db
class TestPreparationViewSet:
    """Tests for the PreparationViewSet."""

    def test_list_preparations_returns_empty_when_no_orders(self, api_client):
        response = api_client.get(PREPARATION_URL)

        assert response.status_code == status.HTTP_200_OK
        assert response.data == []

    def test_list_preparations_returns_only_pending_orders(
        self, api_client, order_factory, block_factory
    ):
        block = block_factory(name="Block 1")
        order_factory(code="ORD-001", status="PENDING", block=block)
        order_factory(code="ORD-002", status="IN_DISPATCH", block=block)
        order_factory(code="ORD-003", status="APPROVED", block=block)

        response = api_client.get(PREPARATION_URL)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["code"] == "ORD-001"
        assert response.data[0]["status"] == "PENDIENTE"

    def test_list_preparations_filters_by_date(self, api_client, order_factory, block_factory):
        block = block_factory()
        today = timezone.now()
        yesterday = today - timedelta(days=1)

        order_factory(
            code="ORD-201", 
            status="PENDING", 
            block=block,
            dispatch_date=today
        )

        order_factory(
            code="ORD-202", 
            status="PENDING", 
            block=block,
            dispatch_date=yesterday
        )

        response = api_client.get(f"{PREPARATION_URL}?date={date.today()}")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["code"] == "ORD-201"

    def test_list_preparations_includes_products(self, api_client, order_factory, block_factory, product_factory):
        block = block_factory()
        product1 = product_factory(name="Product 1", sku="P1")
        product2 = product_factory(name="Product 2", sku="P2")
        
        order = order_factory(
            code="ORD-301",
            status="PENDING",
            block=block
        )

        order.products.set([product1, product2])

        response = api_client.get(PREPARATION_URL)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert len(response.data[0]["products"]) == 2

        product_codes = {p["Name"] for p in response.data[0]["products"]}
        assert "Product 1" in product_codes
        assert "Product 2" in product_codes
