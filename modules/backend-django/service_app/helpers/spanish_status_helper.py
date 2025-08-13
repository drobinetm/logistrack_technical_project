from typing import Optional

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
