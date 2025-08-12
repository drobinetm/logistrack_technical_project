<?php

namespace App\Enum;

enum OrderStatus: string
{
    case COMPLETED = 'COMPLETED';
    case PENDING = 'PENDING';
    case REJECTED = 'REJECTED';
    case DELIVERED = 'DELIVERED';
    case READY_TO_SHIP = 'READY_TO_SHIP';
    case IN_DISPATCH = 'IN_DISPATCH';
    case APPROVED = 'APPROVED';
    case READY_TO_DELIVER = 'READY_TO_DELIVER';
}
