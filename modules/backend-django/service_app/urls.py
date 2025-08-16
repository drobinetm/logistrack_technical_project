from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views
from .viewsets.block_viewsets import BlockDistributionViewSet
from .viewsets.process_viewsets import (
    ConsolidationViewSet,
    DispatchViewSet,
    DistributionOrdersViewSet,
    PreparationViewSet,
    ReceivingViewSet,
    ShippingViewSet,
)
from .viewsets.dashboard_viewsets import DashboardViewSet

router = DefaultRouter()

# Process's endpoints
router.register(r"despacho", DispatchViewSet, basename="dispatch")
router.register(r"preparacion", PreparationViewSet, basename="preparation")
router.register(r"envio", ShippingViewSet, basename="shipping")
router.register(r"recepcion", ReceivingViewSet, basename="receiving")
router.register(r"consolidacion", ConsolidationViewSet, basename="consolidation")
router.register(r"distribucion", DistributionOrdersViewSet, basename="distribution")

# Block's endpoints
router.register(
    r"distribucion/bloques", BlockDistributionViewSet, basename="distribution-blocks"
)

# Dashboard's endpoints
router.register(r"dashboard", DashboardViewSet, basename="dashboard")


urlpatterns = [
    path("", views.index, name="index"),
    path("", include(router.urls)),
]
