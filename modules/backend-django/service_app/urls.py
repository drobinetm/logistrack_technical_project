from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views
from .viewsets.block_viewsets import BlockDistributionViewSet
from .viewsets.process_viewsets import (
    ConsolidationViewSet,
    DispatchViewSet,
    PreparationViewSet,
    ReceivingViewSet,
    ShippingViewSet,
)

router = DefaultRouter()

# Process's endpoints
router.register(r"despacho", DispatchViewSet, basename="dispatch")
router.register(r"preparacion", PreparationViewSet, basename="preparation")
router.register(r"envio", ShippingViewSet, basename="shipping")
router.register(r"recepcion", ReceivingViewSet, basename="receiving")
router.register(r"consolidacion", ConsolidationViewSet, basename="consolidation")

# Block's endpoints
router.register(
    r"distribucion/bloques", BlockDistributionViewSet, basename="distribution"
)

urlpatterns = [
    path("", views.index, name="index"),
    path("", include(router.urls)),
]
