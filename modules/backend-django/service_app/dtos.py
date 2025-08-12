from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

# Utility: snake_case to camelCase


def _to_camel(string: str) -> str:
    parts = string.split("_")
    return parts[0] + "".join(word.capitalize() for word in parts[1:])


SPANISH_STATUS = {
    "COMPLETED": "COMPLETADO",
    "PENDING": "PENDIENTE",
    "REJECTED": "RECHAZADO",
    "DELIVERED": "ENTREGADO",
    "READY_TO_SHIP": "LISTO_PARA_ENVIAR",
    "IN_DISPATCH": "EN_DESPACHO",
    "APPROVED": "APROBADO",
    "READY_TO_DELIVER": "LISTO_PARA_ENTREGAR",
}


def to_spanish_status(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    return SPANISH_STATUS.get(value, value)


class CamelModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=_to_camel)


class DriverDTO(CamelModel):
    id: int
    first_name: str = Field(..., alias="firstName")
    last_name: str = Field(..., alias="lastName")
    license_plate: str = Field(..., alias="licensePlate")
    date_of_birth: date = Field(..., alias="dateOfBirth")


class ProductDTO(CamelModel):
    id: int
    name: str
    sku: str


class OrderDTO(CamelModel):
    id: int
    code: str
    driver: Optional[DriverDTO] = None
    origin: str
    destination: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    dispatch_date: Optional[datetime] = Field(None, alias="dispatchDate")
    user: str
    volume: Optional[float] = None
    weight: Optional[float] = None
    incidents: Optional[str] = None
    number_of_bags: int = Field(..., alias="numberOfBags")
    status: str
    products: List[ProductDTO] = []


class BlockDTO(CamelModel):
    id: int
    name: str
    description: Optional[str] = None
    orders: List[OrderDTO] = []


class PreparationOrderDTO(OrderDTO):
    has_weight: bool = Field(..., alias="hasWeight")
    has_volume: bool = Field(..., alias="hasVolume")


class ConsolidationGroupDTO(CamelModel):
    driver: Optional[DriverDTO] = None
    block_id: Optional[int] = Field(None, alias="blockId")
    block_name: Optional[str] = Field(None, alias="blockName")
    total: int
    completed: int
    pending: int
    rejected: int
    delivered: int
    approved: int
    in_dispatch: int = Field(..., alias="inDispatch")
    ready_to_ship: int = Field(..., alias="readyToShip")
    ready_to_deliver: int = Field(..., alias="readyToDeliver")


class DistributionOrderDTO(OrderDTO):
    confirmation: bool = Field(..., alias="confirmation")


# Factory helpers to map Django ORM instances to DTOs


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
