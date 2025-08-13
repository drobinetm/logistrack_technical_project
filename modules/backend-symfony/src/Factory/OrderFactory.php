<?php

namespace App\Factory;

use App\DTO\OrderSeedDTO;
use App\Entity\Block;
use App\Entity\Driver;
use App\Entity\Order;
use App\Entity\Product;

class OrderFactory
{
    /**
     * Build an Order entity from a DTO and resolved associations.
     *
     * @param Product[] $products
     */
    public function createFromDTO(OrderSeedDTO $dto, ?Driver $driver, ?Block $block, array $products): Order
    {
        $order = new Order(
            code: $dto->code,
            origin: $dto->origin,
            destination: $dto->destination,
            user: $dto->user ?? null,
        );

        $order
            ->setDriver($driver)
            ->setBlock($block)
            ->setLatitude($dto->latitude)
            ->setLongitude($dto->longitude)
            ->setDispatchDate($dto->dispatchDate)
            ->setVolume($dto->volume)
            ->setWeight($dto->weight)
            ->setIncidents($dto->incidents)
            ->setNumberOfBags($dto->numberOfBags)
            ->setStatus($dto->status);

        foreach ($products as $product) {
            $order->addProduct($product);
        }

        return $order;
    }
}
