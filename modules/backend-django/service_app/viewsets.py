from datetime import datetime
from typing import Optional

from django.db.models import Prefetch, Q
from drf_spectacular.utils import (
    OpenApiExample,
    OpenApiParameter,
    OpenApiTypes,
    extend_schema,
)
from rest_framework import mixins, permissions, viewsets
from rest_framework.request import Request
from rest_framework.response import Response

from .dtos import block_to_dto
from .helpers.enum_helper import get_order_status
from .models import Block, Order
from .serializers import BlockDistributionSerializer


class BlockDistributionViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    Read-only endpoint to list blocks with their orders and products.
    Path: /distribucion/bloques/

    Query params:
    - date: YYYY-MM-DD (filters orders by dispatch_date date)
    - driver: int (driver ID)
    - status: str (one of OrderStatus values)
    """

    serializer_class = BlockDistributionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        request: Request = self.request
        date_str: Optional[str] = request.query_params.get("date")
        driver_id: Optional[str] = request.query_params.get("driver")
        status: Optional[str] = request.query_params.get("status")

        order_filters = Q()

        # Filter by date (match date portion of dispatch_date)
        if date_str:
            try:
                target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
                order_filters &= Q(dispatch_date__date=target_date)
            except ValueError:
                # Ignore bad date; return no orders by making filter impossible
                order_filters &= Q(pk__isnull=True)

        if driver_id:
            order_filters &= Q(driver_id=driver_id)

        if status:
            order_filters &= Q(status=status)

        filtered_orders = (
            Order.objects.select_related("driver")
            .prefetch_related("products")
            .filter(order_filters)
            .order_by("dispatch_date", "id")
        )

        # Only include blocks which have at least one matching order
        queryset = (
            Block.objects.prefetch_related(Prefetch("orders", queryset=filtered_orders))
            .filter(orders__in=filtered_orders)
            .distinct()
            .order_by("name")
        )

        return queryset

    # Override list to return camelCase + Spanish status using DTOs
    @extend_schema(
        tags=["Distribución"],
        summary="Distribución - Bloques",
        description="Lista bloques con pedidos y productos. Filtra por fecha, conductor y estado.",
        parameters=[
            OpenApiParameter(
                name="date",
                description="Fecha: Listar bloques por fecha",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="driver",
                description="Chofer: Listar bloques por chofer",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="status",
                description="Estado: Listar bloques por estado",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                enum=get_order_status(),
            ),
        ],
        responses={200: OpenApiTypes.OBJECT},
        examples=[
            OpenApiExample(
                "Ejemplo",
                value=[
                    {
                        "id": 1,
                        "name": "Centro",
                        "description": "Zona centro",
                        "orders": [
                            {
                                "id": 10,
                                "code": "ORD-001",
                                "driver": {
                                    "id": 5,
                                    "firstName": "Juan",
                                    "lastName": "Pérez",
                                    "licensePlate": "ABC123",
                                    "dateOfBirth": "1990-01-01",
                                },
                                "origin": "SME A",
                                "destination": "DC 1",
                                "latitude": 12.34,
                                "longitude": -56.78,
                                "dispatchDate": "2025-08-12T10:00:00Z",
                                "user": "operador",
                                "volume": 1.5,
                                "weight": 20.0,
                                "incidents": None,
                                "numberOfBags": 3,
                                "status": "RECHAZADO",
                                "products": [
                                    {"id": 2, "name": "Caja", "sku": "CAJ-01"}
                                ],
                            }
                        ],
                    }
                ],
            )
        ],
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        queryset = self.get_queryset()
        data = [block_to_dto(block).model_dump(by_alias=True) for block in queryset]
        return Response(data)

    # Override retrieve similarly
    @extend_schema(
        tags=["Distribución"],
        summary="Distribución - Bloque",
        description="Recupera un bloque con sus pedidos y productos.",
        responses={200: OpenApiTypes.OBJECT},
        examples=[
            OpenApiExample(
                "Ejemplo",
                value={
                    "id": 1,
                    "name": "Centro",
                    "description": "Zona centro",
                    "orders": [],
                },
            )
        ],
    )
    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        dto = block_to_dto(instance)
        return Response(dto.model_dump(by_alias=True))
