<?php

namespace App\DTO;

use App\Enum\OrderStatus;
use DateTimeImmutable;

class OrderSeedDTO
{
    public function __construct(
        public string $code,
        public string $origin,
        public string $destination,
        public string $latitude,
        public string $longitude,
        public ?DateTimeImmutable $dispatchDate = null,
        public ?string $user = null,
        public ?string $volume = null,
        public ?string $weight = null,
        public ?string $incidents = null,
        public ?int $numberOfBags = 0,
        public ?OrderStatus $status = OrderStatus::IN_DISPATCH,
        public ?string $driverRef = null,
        public ?string $blockRef = null,
        /** @var string[] */
        public ?array $productRefs = [],
    ) {}
}
