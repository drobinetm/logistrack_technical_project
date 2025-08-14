from datetime import datetime
from typing import List, Optional

from pydantic import Field

from .camel_case_dto import CamelModel
from .driver_model__dto import DriverDTO
from .product_model_dto import ProductDTO


class OrderDTO(CamelModel):
    id: int
    code: str
    origin: str
    destination: str
    user: Optional[str] = None
    status: Optional[str] = None
    driver: Optional[DriverDTO] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    dispatch_date: Optional[datetime] = Field(None, alias="dispatchDate")
    volume: Optional[float] = None
    weight: Optional[float] = None
    incidents: Optional[str] = None
    number_of_bags: Optional[int] = 0
    products: List[ProductDTO] = []
