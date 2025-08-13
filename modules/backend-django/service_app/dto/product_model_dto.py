from pydantic import Field

from .camel_case_dto import CamelModel


class ProductDTO(CamelModel):
    id: int
    name: str = Field(..., alias="Name")
    sku: str = Field(..., alias="Sku")
