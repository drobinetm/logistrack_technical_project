from pydantic import Field

from .order_model_dto import OrderDTO


class DistributionOrderDTO(OrderDTO):
    confirmation: bool = Field(..., alias="confirmation")
