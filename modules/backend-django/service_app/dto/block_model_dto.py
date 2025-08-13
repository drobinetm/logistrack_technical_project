from typing import List, Optional

from .camel_case_dto import CamelModel
from .order_model_dto import OrderDTO


class BlockDTO(CamelModel):
    id: int
    name: str
    description: Optional[str] = None
    orders: List[OrderDTO] = []
