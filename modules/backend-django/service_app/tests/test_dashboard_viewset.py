import pytest
from django.urls import reverse

DASHBOARD_URL = reverse("dashboard-list")


@pytest.mark.django_db
class TestDashboardViewSet:
    def test_list_dashboard_returns_empty_when_no_orders(self, api_client):
        response = api_client.get(DASHBOARD_URL)

        assert response.status_code == 200
        assert response.data["countBlocks"] == 0
        assert response.data["orders"] == []

    def test_list_dashboard_returns_orders_and_block_count(self, api_client, order_factory, block_factory):
        block = block_factory(name="Block X")
        order_factory(code="ORD-001", status="COMPLETED", block=block)
        order_factory(code="ORD-002", status="APPROVED", block=block)

        block = block_factory(name="Block Y")
        order_factory(code="ORD-003", status="APPROVED", block=block)

        response = api_client.get(DASHBOARD_URL)

        assert response.status_code == 200
        assert response.data["countBlocks"] == 2
        assert len(response.data["orders"]) == 3

        codes = [o["code"] for o in response.data["orders"]]
        assert "ORD-001" in codes
        assert "ORD-002" in codes
        assert "ORD-003" in codes

    def test_list_dashboard_with_multiple_orders_in_same_block(self, api_client, order_factory, block_factory):
        block = block_factory(name="Block X")
        order_factory(code="ORD-010", status="COMPLETED", block=block)
        order_factory(code="ORD-011", status="PENDING", block=block)
        order_factory(code="ORD-012", status="APPROVED", block=block)

        response = api_client.get(DASHBOARD_URL)

        assert response.status_code == 200
        assert response.data["countBlocks"] == 1
        assert len(response.data["orders"]) == 3

    def test_list_dashboard_includes_all_fields(self, api_client, order_factory):
        order_factory(
            code="ORD-100",
            status="completed",
            destination="Destino Test",
            latitude=9.123456,
            longitude=-84.654321,
            user="Ana López"
        )

        response = api_client.get(DASHBOARD_URL)

        assert response.status_code == 200

        data = response.data["orders"][0]
        expected_fields = ["status", "destination", "code", "latitude", "longitude"]

        for field in expected_fields:
            assert field in data
        assert data["code"] == "ORD-100"
