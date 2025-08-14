<?php

namespace App\Message;

readonly class EventMessage
{
    public function __construct(
        private string $eventType,
        private array $payload
    ) {}

    public function getEventType(): string
    {
        return $this->eventType;
    }

    public function getPayload(): array
    {
        return $this->payload;
    }
}
