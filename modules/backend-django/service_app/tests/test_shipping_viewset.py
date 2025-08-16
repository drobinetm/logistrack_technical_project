import pytest
from datetime import date, timedelta
from django.utils import timezone
from django.urls import reverse
from rest_framework import status

SHIPPING_URL = reverse("shipping-list")


@pytest.mark.django_db
class TestShippingViewSet:
    def test_list_shipping_returns_empty_when_no_orders(self, api_client):
        response = api_client.get(SHIPPING_URL)

        assert response.status_code == status.HTTP_200_OK
        assert response.data == []

    def test_list_shipping_returns_only_completed_orders(
        self, api_client, order_factory, block_factory, driver_factory
    ):
        block = block_factory()
        driver = driver_factory()
        
        order_factory(code="ORD-001", status="COMPLETED", block=block, driver=driver)
        order_factory(code="ORD-002", status="PENDING", block=block, driver=driver)
        order_factory(code="ORD-003", status="IN_DISPATCH", block=block, driver=driver)

        response = api_client.get(SHIPPING_URL)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["code"] == "ORD-001"
        assert response.data[0]["status"] == "COMPLETADO"

    def test_list_shipping_includes_required_fields(
        self, api_client, order_factory, block_factory, driver_factory
    ):
        block = block_factory()
        driver = driver_factory(
            first_name="John",
            last_name="Doe",
            license_plate="ABC123"
        )
        
        order_factory(
            code="ORD-100",
            status="COMPLETED",
            origin="DC 1",
            destination="Sucursal Norte",
            latitude=10.123456,
            longitude=-84.654321,
            block=block,
            driver=driver,
            number_of_bags=3
        )

        response = api_client.get(SHIPPING_URL)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.data[0]
        
        expected_fields = [
            "id", "code", "origin", "destination", "latitude", "longitude",
            "dispatchDate", "status", "user", "numberOfBags", "products", "driver"
        ]
        
        for field in expected_fields:
            assert field in data
            
        assert data["numberOfBags"] == 3
        assert data["driver"]["firstName"] == "John"
        assert data["driver"]["lastName"] == "Doe"
        assert data["driver"]["licensePlate"] == "ABC123"

    def test_list_shipping_filters_by_date(
        self, api_client, order_factory, block_factory, driver_factory
    ):
        block = block_factory()
        driver = driver_factory()
        today = timezone.now()
        yesterday = today - timedelta(days=1)
        
        order_factory(
            code="ORD-201", 
            status="COMPLETED", 
            block=block,
            driver=driver,
            dispatch_date=today
        )
        
        order_factory(
            code="ORD-202", 
            status="COMPLETED", 
            block=block,
            driver=driver,
            dispatch_date=yesterday
        )

        response = api_client.get(f"{SHIPPING_URL}?date={date.today()}")
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["code"] == "ORD-201"

    def test_list_shipping_includes_products(
        self, api_client, order_factory, block_factory, driver_factory, product_factory
    ):
        block = block_factory()
        driver = driver_factory()
        product1 = product_factory(name="Product 1", sku="P1")
        product2 = product_factory(name="Product 2", sku="P2")
        
        order = order_factory(
            code="ORD-301",
            status="COMPLETED",
            block=block,
            driver=driver
        )
        
        order.products.set([product1, product2])

        response = api_client.get(SHIPPING_URL)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert len(response.data[0]["products"]) == 2
        
        product_names = {p["Name"] for p in response.data[0]["products"]}
        assert "Product 1" in product_names
        assert "Product 2" in product_names
