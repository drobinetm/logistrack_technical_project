import pytest
from datetime import date, timedelta
from django.utils import timezone
from django.urls import reverse
from rest_framework import status

CONSOLIDATION_URL = reverse("consolidation-list")


@pytest.mark.django_db
class TestConsolidationViewSet:
    def test_list_consolidation_returns_empty_when_no_orders(self, api_client):
        response = api_client.get(CONSOLIDATION_URL)

        assert response.status_code == status.HTTP_200_OK
        assert response.data == []

    def test_list_consolidation_returns_only_in_consolidation_orders(
        self, api_client, order_factory, block_factory, driver_factory
    ):
        block = block_factory()
        driver = driver_factory()
        
        order_factory(code="ORD-001", status="APPROVED", block=block, driver=driver)
        order_factory(code="ORD-002", status="PENDING", block=block, driver=driver)
        order_factory(code="ORD-003", status="COMPLETED", block=block, driver=driver)

        response = api_client.get(CONSOLIDATION_URL)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["orders"][0]["code"] == "ORD-001"
        assert response.data[0]["orders"][0]["status"] == "APROBADO"

    def test_list_consolidation_includes_required_fields(
        self, api_client, order_factory, block_factory, product_factory, driver_factory
    ):
        block = block_factory()
        driver = driver_factory()
        product1 = product_factory(name="Product 1", sku="P1")
        product2 = product_factory(name="Product 2", sku="P2")
        
        order = order_factory(
            code="ORD-100",
            status="APPROVED",
            origin="DC 1",
            destination="Sucursal Central",
            latitude=10.123456,
            longitude=-84.654321,
            block=block,
            driver=driver,
            volume=5.5,
            weight=10.2,
            number_of_bags=3
        )
        order.products.set([product1, product2])

        response = api_client.get(CONSOLIDATION_URL)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.data[0]["orders"][0]
        
        expected_fields = [
            "code", "origin", "destination","dispatchDate",
            "status", "user", "numberOfBags", "products",
            "driver"
        ]
        
        for field in expected_fields:
            assert field in data
            
        assert data["numberOfBags"] == 3
        assert data["status"] == "APROBADO"
        assert len(data["products"]) == 2

    def test_list_consolidation_filters_by_date(
        self, api_client, order_factory, block_factory, driver_factory
    ):
        block = block_factory()
        driver = driver_factory()

        today = timezone.now()
        yesterday = today - timedelta(days=1)
        
        order_factory(
            code="ORD-201", 
            status="APPROVED",
            block=block,
            driver=driver,
            dispatch_date=today
        )
        
        order_factory(
            code="ORD-202", 
            status="APPROVED",
            block=block,
            driver=driver,
            dispatch_date=yesterday
        )

        response = api_client.get(f"{CONSOLIDATION_URL}?date={date.today()}")
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["orders"][0]["code"] == "ORD-201"

    def test_list_consolidation_includes_products(
        self, api_client, order_factory, block_factory, product_factory, driver_factory
    ):
        block = block_factory()
        driver = driver_factory()

        product1 = product_factory(name="Laptop", sku="LP-001")
        product2 = product_factory(name="Mouse", sku="MS-002")
        
        order = order_factory(
            code="ORD-300",
            status="APPROVED",
            block=block,
            driver=driver
        )
        order.products.set([product1, product2])

        response = api_client.get(CONSOLIDATION_URL)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data[0]["orders"][0]["products"]) == 2

        product_names = {p["Name"] for p in response.data[0]["orders"][0]["products"]}
        assert "Laptop" in product_names
        assert "Mouse" in product_names
