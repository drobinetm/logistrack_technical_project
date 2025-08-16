import pytest
from datetime import date, timedelta
from django.utils import timezone
from django.urls import reverse
from rest_framework import status

DISTRIBUTION_URL = reverse("distribution-list")


@pytest.mark.django_db
class TestDistributionOrdersViewSet:
    def test_list_distribution_returns_empty_when_no_orders(self, api_client):
        response = api_client.get(DISTRIBUTION_URL)

        assert response.status_code == status.HTTP_200_OK
        assert response.data == []

    def test_list_distribution_returns_only_in_distribution_orders(
        self, api_client, order_factory, block_factory
    ):
        block = block_factory()
        
        order_factory(code="ORD-001", status="DELIVERED", block=block)
        order_factory(code="ORD-002", status="PENDING", block=block)
        order_factory(code="ORD-003", status="COMPLETED", block=block)

        response = api_client.get(DISTRIBUTION_URL)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["code"] == "ORD-001"
        assert response.data[0]["status"] == "ENTREGADO"

    def test_list_distribution_includes_required_fields(
        self, api_client, order_factory, block_factory, driver_factory, product_factory
    ):
        block = block_factory()
        driver = driver_factory(
            first_name="Carlos",
            last_name="Lopez",
            license_plate="XYZ123"
        )
        product1 = product_factory(name="Product 1", sku="P1")
        product2 = product_factory(name="Product 2", sku="P2")
        
        order = order_factory(
            code="ORD-100",
            status="DELIVERED",
            origin="DC 1",
            destination="Sucursal Este",
            latitude=9.876543,
            longitude=-83.123456,
            block=block,
            driver=driver,
            volume=2.5,
            weight=7.8,
            number_of_bags=2
        )
        order.products.set([product1, product2])

        response = api_client.get(DISTRIBUTION_URL)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.data[0]
        
        expected_fields = [
            "id", "code", "origin", "destination", "latitude", "longitude",
            "dispatchDate", "status", "user", "numberOfBags", "products",
            "driver"
        ]
        
        for field in expected_fields:
            assert field in data
            
        assert data["numberOfBags"] == 2
        assert data["status"] == "ENTREGADO"
        assert len(data["products"]) == 2
        assert data["driver"]["firstName"] == "Carlos"
        assert data["driver"]["lastName"] == "Lopez"
        assert data["driver"]["licensePlate"] == "XYZ123"

    def test_list_distribution_filters_by_date(
        self, api_client, order_factory, block_factory
    ):
        block = block_factory()
        today = timezone.now()
        tomorrow = today + timedelta(days=1)
        
        order_factory(
            code="ORD-201", 
            status="DELIVERED",
            block=block,
            dispatch_date=today
        )
        
        order_factory(
            code="ORD-202", 
            status="DELIVERED",
            block=block,
            dispatch_date=tomorrow
        )

        response = api_client.get(f"{DISTRIBUTION_URL}?date={date.today()}")
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["code"] == "ORD-201"

    def test_list_distribution_filters_by_driver(
        self, api_client, order_factory, block_factory, driver_factory
    ):
        block = block_factory()
        driver1 = driver_factory(license_plate="ABC123")
        driver2 = driver_factory(license_plate="XYZ789")
        
        order_factory(
            code="ORD-301",
            status="DELIVERED",
            block=block,
            driver=driver1
        )
        
        order_factory(
            code="ORD-302",
            status="DELIVERED",
            block=block,
            driver=driver2
        )

        response = api_client.get(f"{DISTRIBUTION_URL}?driver={driver1.id}")
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["code"] == "ORD-301"
        assert response.data[0]["driver"]["licensePlate"] == "ABC123"
