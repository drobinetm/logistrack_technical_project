import pytest
from datetime import date, timedelta
from django.utils import timezone
from django.urls import reverse
from rest_framework import status

RECEIVING_URL = reverse("receiving-list")


@pytest.mark.django_db
class TestReceivingViewSet:
    def test_list_receiving_returns_empty_when_no_orders(self, api_client):
        response = api_client.get(RECEIVING_URL)

        assert response.status_code == status.HTTP_200_OK
        assert response.data == []

    def test_list_receiving_returns_only_ready_to_ship_orders(
        self, api_client, order_factory, block_factory
    ):
        block = block_factory()
        
        order_factory(code="ORD-001", status="READY_TO_SHIP", block=block)
        order_factory(code="ORD-002", status="COMPLETED", block=block)
        order_factory(code="ORD-003", status="PENDING", block=block)

        response = api_client.get(RECEIVING_URL)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["code"] == "ORD-001"
        assert response.data[0]["status"] == "LISTO_PARA_ENVIAR"

    def test_list_receiving_includes_required_fields(
        self, api_client, order_factory, block_factory, driver_factory
    ):
        block = block_factory()
        driver = driver_factory(
            first_name="Maria",
            last_name="Garcia",
            license_plate="XYZ789"
        )
        
        order_factory(
            code="ORD-100",
            status="READY_TO_SHIP",
            origin="DC 1",
            destination="Sucursal Sur",
            latitude=9.876543,
            longitude=-83.123456,
            block=block,
            driver=driver,
            number_of_bags=5,
            incidents="Paquete dañado"
        )

        response = api_client.get(RECEIVING_URL)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.data[0]
        
        expected_fields = [
            "id", "code", "origin", "destination", "latitude", "longitude",
            "dispatchDate", "status", "user", "numberOfBags", "products",
            "driver", "hasIncidents"
        ]
        
        for field in expected_fields:
            assert field in data
            
        assert data["numberOfBags"] == 5
        assert data["hasIncidents"] is True
        assert data["driver"]["firstName"] == "Maria"
        assert data["driver"]["lastName"] == "Garcia"
        assert data["status"] == "LISTO_PARA_ENVIAR"

    def test_list_receiving_without_incidents(
        self, api_client, order_factory, block_factory
    ):
        block = block_factory()
        
        order_factory(
            code="ORD-200",
            status="READY_TO_SHIP",
            block=block,
            incidents=None
        )

        response = api_client.get(RECEIVING_URL)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data[0]["hasIncidents"] is False

    def test_list_receiving_filters_by_date(
        self, api_client, order_factory, block_factory
    ):
        block = block_factory()
        today = timezone.now()
        tomorrow = today + timedelta(days=1)
        
        order_factory(
            code="ORD-201", 
            status="READY_TO_SHIP", 
            block=block,
            dispatch_date=today
        )
        
        order_factory(
            code="ORD-202", 
            status="READY_TO_SHIP", 
            block=block,
            dispatch_date=tomorrow
        )

        response = api_client.get(f"{RECEIVING_URL}?date={date.today()}")
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["code"] == "ORD-201"
