from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views
from .lifecycle_viewsets import (
    ConsolidationViewSet,
    DispatchViewSet,
    DistributionOrdersViewSet,
    PreparationViewSet,
    ReceivingViewSet,
    ShippingViewSet,
)
from .viewsets import BlockDistributionViewSet

router = DefaultRouter()

# Block's endpoints
router.register(
    r"distribucion/bloques", BlockDistributionViewSet, basename="block-distribution"
)

# Lifecycle endpoints
router.register(r"despacho", DispatchViewSet, basename="dispatch")
router.register(r"preparacion", PreparationViewSet, basename="preparation")
router.register(r"envio", ShippingViewSet, basename="shipping")
router.register(r"recepcion", ReceivingViewSet, basename="receiving")
router.register(r"consolidacion", ConsolidationViewSet, basename="consolidation")
router.register(
    r"distribucion/pedidos", DistributionOrdersViewSet, basename="distribution-orders"
)

urlpatterns = [
    path("", views.index, name="index"),
    path("", include(router.urls)),
]
