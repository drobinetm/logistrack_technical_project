from datetime import date

from pydantic import Field

from .camel_case_dto import CamelModel


class DriverDTO(CamelModel):
    id: int
    first_name: str = Field(..., alias="firstName")
    last_name: str = Field(..., alias="lastName")
    license_plate: str = Field(..., alias="licensePlate")
    date_of_birth: date = Field(..., alias="dateOfBirth")
