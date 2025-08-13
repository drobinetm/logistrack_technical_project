from typing import List, Optional

from ..dto.block_model_dto import BlockDTO
from ..dto.consolidation_process_dto import ConsolidationGroupDTO
from ..dto.distribution_process_dto import DistributionOrderDTO
from ..dto.driver_model__dto import DriverDTO
from ..dto.order_model_dto import OrderDTO
from ..dto.preparation_process_dto import PreparationOrderDTO
from ..dto.product_model_dto import ProductDTO
from .spanish_status_helper import to_spanish_status


def driver_to_dto(driver) -> Optional[DriverDTO]:
    if driver is None:
        return None

    return DriverDTO(
        id=driver.id,
        firstName=driver.first_name,
        lastName=driver.last_name,
        licensePlate=driver.license_plate,
        dateOfBirth=driver.date_of_birth,
    )


def preparation_order_to_dto(order) -> PreparationOrderDTO:
    base = order_to_dto(order)

    return PreparationOrderDTO(
        **base.model_dump(),
        hasWeight=order.weight is not None,
        hasVolume=order.volume is not None,
    )


def build_consolidation_group(driver, block, orders: List) -> ConsolidationGroupDTO:
    # Count by status
    def count(status: str) -> int:
        return sum(1 for o in orders if getattr(o, "status", None) == status)

    return ConsolidationGroupDTO(
        driver=driver_to_dto(driver) if driver else None,
        blockId=block.id if block else None,
        blockName=block.name if block else None,
        total=len(orders),
        completed=count("COMPLETED"),
        pending=count("PENDING"),
        rejected=count("REJECTED"),
        delivered=count("DELIVERED"),
        approved=count("APPROVED"),
        inDispatch=count("IN_DISPATCH"),
        readyToShip=count("READY_TO_SHIP"),
        readyToDeliver=count("READY_TO_DELIVER"),
    )


def distribution_order_to_dto(order) -> DistributionOrderDTO:
    base = order_to_dto(order)
    confirmed = order.status == "DELIVERED"

    return DistributionOrderDTO(**base.model_dump(), confirmation=confirmed)


def product_to_dto(product) -> ProductDTO:
    return ProductDTO(id=product.id, name=product.name, sku=product.sku)


def order_to_dto(order) -> OrderDTO:
    return OrderDTO(
        id=order.id,
        code=order.code,
        driver=driver_to_dto(order.driver),
        origin=order.origin,
        destination=order.destination,
        latitude=float(order.latitude) if order.latitude is not None else None,
        longitude=float(order.longitude) if order.longitude is not None else None,
        dispatchDate=order.dispatch_date,
        user=order.user,
        volume=float(order.volume) if order.volume is not None else None,
        weight=float(order.weight) if order.weight is not None else None,
        incidents=order.incidents,
        numberOfBags=order.number_of_bags,
        status=to_spanish_status(order.status),
        products=[product_to_dto(p) for p in order.products.all()],
    )


def block_to_dto(block, orders=None) -> BlockDTO:
    # If orders is provided (prefetched/filtered list), use it; else use related manager
    ords = orders if orders is not None else list(block.orders.all())

    return BlockDTO(
        id=block.id,
        name=block.name,
        description=block.description,
        orders=[order_to_dto(o) for o in ords],
    )
