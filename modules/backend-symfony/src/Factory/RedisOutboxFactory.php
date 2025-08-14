<?php

namespace App\Factory;

use App\DTO\RedisOutboxDTO;
use App\Entity\RedisOutbox;
use Exception;

class RedisOutboxFactory
{
    /**
     * Create a RedisOutbox entity from a RedisOutboxDTO
     *
     * @throws Exception
     */
    public function createFromDTO(RedisOutboxDTO $dto): RedisOutbox
    {
        $outbox = new RedisOutbox(
            eventType: $dto->eventType,
            payload: $dto->payload
        );

        if ($dto->published) {
            $outbox->markPublished();
        }

        return $outbox;
    }
}
