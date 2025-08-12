def get_order_status(only_dict: bool = False):
    """
    Get the list of order status in Spanish

    Returns a list of strings with the order status in Spanish.

    :param only_dict: If True, return a dictionary with the order status in Spanish
    :return: List of strings with the order status in Spanish
    :rtype: List[str]
    """
    order_status: dict = {
        "COMPLETADO": "COMPLETED",
        "PENDIENTE": "PENDING",
        "RECHAZADO": "REJECTED",
        "ENTREGADO": "DELIVERED",
        "LISTO_PARA_ENVIO": "READY_TO_SHIP",
        "EN_DESPACHO": "IN_DISPATCH",
        "APROBADO": "APPROVED",
        "LISTO_PARA_ENTREGA": "READY_TO_DELIVER",
    }

    if only_dict:
        return order_status

    return list(order_status.keys())
