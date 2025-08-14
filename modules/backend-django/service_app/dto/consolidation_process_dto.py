from typing import List, Optional

from pydantic import Field

from .camel_case_dto import CamelModel
from .driver_model__dto import DriverDTO
from .order_model_dto import OrderDTO


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
    orders: List[OrderDTO] = Field(default_factory=list)
