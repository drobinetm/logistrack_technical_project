from pydantic import Field

from .order_model_dto import OrderDTO


class PreparationOrderDTO(OrderDTO):
    has_weight: bool = Field(..., alias="hasWeight")
    has_volume: bool = Field(..., alias="hasVolume")
