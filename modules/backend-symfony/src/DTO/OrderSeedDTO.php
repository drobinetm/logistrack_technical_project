<?php

namespace App\DTO;

use App\Enum\OrderStatus;

class OrderSeedDTO
{
    public function __construct(
        public string $code,
        public string $origin,
        public string $destination,
        public ?string $latitude,
        public ?string $longitude,
        public ?\DateTimeImmutable $dispatchDate,
        public string $user,
        public ?string $volume,
        public ?string $weight,
        public ?string $incidents,
        public int $numberOfBags,
        public OrderStatus $status,
        public ?string $driverRef,
        public ?string $blockRef,
        /** @var string[] */
        public array $productRefs = [],
    ) {}
}
