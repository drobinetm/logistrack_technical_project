import pytest
from datetime import date, timedelta
from django.utils import timezone
from django.urls import reverse
from rest_framework import status

DISPATCH_URL = reverse("dispatch-list")


@pytest.mark.django_db
class TestDispatchViewSet:
    """Tests for the DispatchViewSet."""

    def test_list_dispatches_returns_empty_when_no_orders(self, api_client):
        response = api_client.get(DISPATCH_URL)

        assert response.status_code == status.HTTP_200_OK
        assert response.data == []

    def test_list_dispatches_returns_only_in_dispatch_orders(
        self, api_client, order_factory, block_factory
    ):
        block = block_factory(name="Block 1")
        order_factory(code="ORD-001", status="IN_DISPATCH", block=block)
        order_factory(code="ORD-002", status="PENDING", block=block)
        order_factory(code="ORD-003", status="APPROVED", block=block)

        response = api_client.get(DISPATCH_URL)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["code"] == "ORD-001"
        assert response.data[0]["status"] == "EN_DESPACHO"

    def test_list_dispatches_includes_required_fields(self, api_client, order_factory, block_factory):
        block = block_factory(name="Block 2")
        order_factory(
            code="ORD-100",
            status="IN_DISPATCH",
            origin="Origin Test",
            destination="Destination Test",
            latitude=10.123456,
            longitude=-84.654321,
            block=block
        )

        response = api_client.get(DISPATCH_URL)
        assert response.status_code == status.HTTP_200_OK

        data = response.data[0]

        expected_fields = [
            "id", "code", "origin", "destination", 
            "latitude", "longitude", "dispatchDate", "status"
        ]
        for field in expected_fields:
            assert field in data

    def test_list_dispatches_filters_by_date(self, api_client, order_factory, block_factory):
        block = block_factory()
        today = timezone.now()
        yesterday = today - timedelta(days=1)
        
        order_factory(
            code="ORD-201", 
            status="IN_DISPATCH", 
            block=block,
            dispatch_date=today
        )

        order_factory(
            code="ORD-202", 
            status="IN_DISPATCH", 
            block=block,
            dispatch_date=yesterday
        )

        response = api_client.get(f"{DISPATCH_URL}?date={date.today()}")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["code"] == "ORD-201"

    def test_list_dispatches_filters_by_driver(self, api_client, order_factory, block_factory, driver_factory):
        block = block_factory()
        driver1 = driver_factory(first_name="Driver", last_name="One")
        driver2 = driver_factory(first_name="Driver", last_name="Two")
        
        order_factory(
            code="ORD-301", 
            status="IN_DISPATCH", 
            block=block,
            driver=driver1
        )
        order_factory(
            code="ORD-302", 
            status="IN_DISPATCH", 
            block=block,
            driver=driver2
        )

        response = api_client.get(f"{DISPATCH_URL}?driver={driver1.id}")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["code"] == "ORD-301"
