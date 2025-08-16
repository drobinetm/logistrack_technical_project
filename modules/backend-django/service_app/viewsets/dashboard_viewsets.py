from rest_framework import viewsets
from rest_framework.request import Request
from rest_framework.response import Response
from ..models import Order, Block
from ..serializers import OrderDashboardSerializer


class DashboardViewSet(viewsets.ViewSet):
    @staticmethod
    def get_queryset():
        return Order.objects.all()

    def list(self, request: Request, *args, **kwargs) -> Response:
        # Get all orders
        orders = self.get_queryset()
        serializer = OrderDashboardSerializer(orders, many=True)

        # Get the blocks with completed and approved status
        blocks_count = (
            Block.objects.filter(
                orders__status__in=["COMPLETED", "APPROVED"]
            )
            .distinct()
            .count()
        )

        response = {
            "countBlocks": blocks_count,
            "orders": serializer.data,
        }

        return Response(response)
