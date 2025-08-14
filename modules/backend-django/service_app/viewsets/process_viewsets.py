from datetime import datetime
from typing import Dict, List, Optional, Tuple

from django.db.models import Q
from drf_spectacular.utils import (
    OpenApiExample,
    OpenApiParameter,
    OpenApiTypes,
    extend_schema,
)
from rest_framework import mixins, permissions, viewsets
from rest_framework.request import Request
from rest_framework.response import Response

from ..helpers.dto_helper import (
    build_consolidation_group,
    dispatch_order_to_dict,
    distribution_order_to_dto,
    order_to_dto,
    preparation_order_to_dict,
)
from ..helpers.enum_helper import get_order_status
from ..models import Order


class BaseOrderListViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [permissions.AllowAny]

    @staticmethod
    def _build_filters(request: Request) -> Q:
        date_str: Optional[str] = request.query_params.get("date")
        driver_id: Optional[str] = request.query_params.get("driver")
        block_id: Optional[str] = request.query_params.get("block")
        status: Optional[str] = request.query_params.get("status")

        filters = Q()
        if date_str:
            try:
                target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
                filters &= Q(dispatch_date__date=target_date)
            except ValueError:
                filters &= Q(pk__isnull=True)
        if driver_id:
            filters &= Q(driver_id=driver_id)
        if block_id:
            filters &= Q(block_id=block_id)
        if status:
            normalized = get_order_status(only_dict=True).get(status.upper(), status)
            filters &= Q(status=normalized)
        return filters

    @staticmethod
    def get_base_queryset(extra_filters: Q = Q()):
        return (
            Order.objects.select_related("driver", "block")
            .prefetch_related("products")
            .filter(extra_filters)
            .order_by("dispatch_date", "id")
        )


class DispatchViewSet(BaseOrderListViewSet):
    """Orders sent from SMEs to DC (default status: IN_DISPATCH)."""

    def get_queryset(self):
        filters = self._build_filters(self.request) & Q(status="IN_DISPATCH")
        return self.get_base_queryset(filters)

    @extend_schema(
        tags=["Procesos"],
        summary="Mostrar órdenes enviadas desde PYMEs a Centros de Distribución (CD)",
        description="Lista pedidos en despacho con filtros opcionales.",
        parameters=[
            OpenApiParameter(
                name="date",
                description="Fecha: Listar pedidos por fecha",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="driver",
                description="Chofer: Listar pedidos por chofer",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="block",
                description="Bloque: Listar pedidos por bloque",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="status",
                description="Estado: Listar pedidos por estado",
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
                        "id": 10,
                        "code": "ORD-001",
                        "origin": "SME A",
                        "destination": "DC 1",
                        "latitude": 12.34,
                        "longitude": -56.78,
                        "dispatchDate": "2025-08-12T10:00:00Z",
                        "status": "EN_DESPACHO",
                    }
                ],
            )
        ],
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        data = [
            dispatch_order_to_dict(order_to_dto(o).model_dump(by_alias=True))
            for o in self.get_queryset()
        ]

        return Response(data)


class PreparationViewSet(BaseOrderListViewSet):
    """Prepared orders with products and weight/volume status (default: PENDING)."""

    def get_queryset(self):
        filters = self._build_filters(self.request) & Q(status="PENDING")
        return self.get_base_queryset(filters)

    @extend_schema(
        tags=["Procesos"],
        summary="Visualizar las órdenes preparadas, con productos y estado de peso/volumen.",
        description="Lista pedidos preparados (PENDING) con indicadores de peso/volumen.",
        parameters=[
            OpenApiParameter(
                name="date",
                description="Fecha: Listar pedidos por fecha",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="driver",
                description="Chofer: Listar pedidos por chofer",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="block",
                description="Bloque: Listar pedidos por bloque",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="status",
                description="Estado: Listar pedidos por estado",
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
                        "id": 11,
                        "code": "ORD-002",
                        "origin": "SME B",
                        "destination": "DC 2",
                        "dispatchDate": "2025-08-12T12:00:00Z",
                        "numberOfBags": 2,
                        "status": "APROBADO",
                        "products": [{"id": 3, "name": "Bolsa", "sku": "BLS-10"}],
                        "hasWeight": True,
                        "hasVolume": False,
                    }
                ],
            )
        ],
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        data = [
            preparation_order_to_dict(order_to_dto(o).model_dump(by_alias=True))
            for o in self.get_queryset()
        ]

        return Response(data)


class ShippingViewSet(BaseOrderListViewSet):
    """Orders ready to ship (default: COMPLETED)."""

    def get_queryset(self):
        filters = self._build_filters(self.request) & Q(status="COMPLETED")
        return self.get_base_queryset(filters)

    @extend_schema(
        tags=["Procesos"],
        summary="Órdenes listas para salir, asociadas a transportistas o vehículos.",
        description="Lista pedidos listos para envio.",
        parameters=[
            OpenApiParameter(
                name="date",
                description="Fecha: Listar pedidos por fecha",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="driver",
                description="Chofer: Listar pedidos por chofer",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="block",
                description="Bloque: Listar pedidos por bloque",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="status",
                description="Estado: Listar pedidos por estado",
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
                        "id": 12,
                        "code": "ORD-003",
                        "driver": {
                            "id": 5,
                            "firstName": "Juan",
                            "lastName": "Pérez",
                            "licensePlate": "ABC123",
                            "dateOfBirth": "1990-01-01",
                        },
                        "origin": "DC 1",
                        "destination": "Sucursal Norte",
                        "dispatchDate": "2025-08-12T14:00:00Z",
                        "user": "operador",
                        "numberOfBags": 4,
                        "status": "LISTO_PARA_ENVIO",
                        "products": [],
                    }
                ],
            )
        ],
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        data = [order_to_dto(o).model_dump(by_alias=True) for o in self.get_queryset()]
        return Response(data)


class ReceivingViewSet(BaseOrderListViewSet):
    """Receipt at DC; show incidents (default: READY_TO_SHIP)."""

    def get_queryset(self):
        filters = self._build_filters(self.request) & Q(status="READY_TO_SHIP")
        return self.get_base_queryset(filters)

    @extend_schema(
        tags=["Procesos"],
        summary="Recepción de bolsas/órdenes en el CD. Mostrar si hay incidencias",
        description="Lista pedidos recibidos en CD (Centros de Distribución (CD)) incluyendo indicador de incidentes.",
        parameters=[
            OpenApiParameter(
                name="date",
                description="Fecha: Listar pedidos por fecha",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="driver",
                description="Chofer: Listar pedidos por chofer",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="block",
                description="Bloque: Listar pedidos por bloque",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="status",
                description="Estado: Listar pedidos por estado",
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
                        "id": 13,
                        "code": "ORD-004",
                        "driver": {
                            "id": 7,
                            "firstName": "Luis",
                            "lastName": "García",
                            "licensePlate": "DEF456",
                            "dateOfBirth": "1985-03-22",
                        },
                        "origin": "DC 2",
                        "destination": "Sucursal Sur",
                        "dispatchDate": "2025-08-12T15:30:00Z",
                        "user": "operador",
                        "numberOfBags": 1,
                        "status": "LISTO_PARA_ENTREGA",
                        "products": [],
                        "hasIncidents": True,
                    }
                ],
            )
        ],
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        result = []
        for o in self.get_queryset():
            dto = order_to_dto(o).model_dump(by_alias=True)
            dto["hasIncidents"] = bool(o.incidents)
            result.append(dto)
        return Response(result)


class ConsolidationViewSet(BaseOrderListViewSet):
    """Group orders by driver and block; return completion status counts."""

    def get_queryset(self):
        filters = self._build_filters(self.request) & Q(status="APPROVED")
        return self.get_base_queryset(filters)

    @extend_schema(
        tags=["Procesos"],
        summary="Agrupación de órdenes por chofer/bloque. Estado de completitud",
        description="Consolida pedidos por conductor y bloque con conteos de estados.",
        parameters=[
            OpenApiParameter(
                name="date",
                description="Fecha: Listar pedidos por fecha",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="driver",
                description="Chofer: Listar pedidos por chofer",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="block",
                description="Bloque: Listar pedidos por bloque",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="status",
                description="Estado: Listar pedidos por estado",
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
                        "driver": {
                            "id": 5,
                            "firstName": "Juan",
                            "lastName": "Pérez",
                            "licensePlate": "ABC123",
                            "dateOfBirth": "1990-01-01",
                        },
                        "blockId": 2,
                        "blockName": "Centro",
                        "total": 10,
                        "completed": 6,
                        "pending": 2,
                        "rejected": 1,
                        "delivered": 5,
                        "approved": 3,
                        "inDispatch": 2,
                        "readyToShip": 1,
                        "readyToDeliver": 2,
                        "orders": [
                            {
                                "id": 14,
                                "code": "ORD-005",
                                "driver": {
                                    "id": 8,
                                    "firstName": "Ana",
                                    "lastName": "Ruiz",
                                    "licensePlate": "GHI789",
                                    "dateOfBirth": "1992-09-15",
                                },
                                "origin": "DC 3",
                                "destination": "Cliente Final",
                                "dispatchDate": "2025-08-12T16:00:00Z",
                                "user": "operador",
                                "numberOfBags": 1,
                                "status": "APROVADO",
                                "products": [],
                                "confirmation": True,
                            }
                        ],
                    }
                ],
            )
        ],
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        orders = list(self.get_queryset())

        groups: Dict[Tuple[Optional[int], Optional[int]], List[Order]] = {}
        for o in orders:
            key = (o.driver_id, o.block_id)
            groups.setdefault(key, []).append(o)

        data = []
        # We'll need driver and block instances; prefetch done in queryset
        for (driver_id, block_id), ords in groups.items():
            driver = ords[0].driver if ords and ords[0].driver.id == driver_id else None
            block = ords[0].block if ords and ords[0].block.id == block_id else None
            dto = build_consolidation_group(driver, block, ords)
            data.append(dto.model_dump(by_alias=True))
        return Response(data)


class DistributionOrdersViewSet(BaseOrderListViewSet):
    """Deliveries made, pending, and rejected, with confirmations."""

    def get_queryset(self):
        filters = self._build_filters(self.request) & Q(
            status__in=["DELIVERED", "PENDING", "REJECTED"]
        )
        queryset = self.get_base_queryset(filters)

        # For PENDING orders, ensure user and driver are not null
        pending_orders = Q(status="PENDING")
        has_user_and_driver = Q(user__isnull=False) & Q(driver__isnull=False)

        # Only include PENDING orders that have both user and driver
        valid_pending_orders = ~pending_orders | (pending_orders & has_user_and_driver)

        return queryset.filter(valid_pending_orders)

    @extend_schema(
        tags=["Procesos"],
        summary="Entregas realizadas, pendientes y rechazadas con confirmaciones.",
        description="Lista pedidos entregados, pendientes o rechazados, con confirmación.",
        parameters=[
            OpenApiParameter(
                name="date",
                description="Fecha: Listar pedidos por fecha",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="driver",
                description="Chofer: Listar pedidos por chofer",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="block",
                description="Bloque: Listar pedidos por bloque",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="status",
                description="Estado: Listar pedidos por estado",
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
                        "id": 14,
                        "code": "ORD-005",
                        "driver": {
                            "id": 8,
                            "firstName": "Ana",
                            "lastName": "Ruiz",
                            "licensePlate": "GHI789",
                            "dateOfBirth": "1992-09-15",
                        },
                        "origin": "DC 3",
                        "destination": "Cliente Final",
                        "dispatchDate": "2025-08-12T16:00:00Z",
                        "user": "operador",
                        "numberOfBags": 1,
                        "status": "ENTREGADO",
                        "products": [],
                        "confirmation": True,
                    }
                ],
            )
        ],
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        data = [
            distribution_order_to_dto(o).model_dump(by_alias=True)
            for o in self.get_queryset()
        ]
        return Response(data)
