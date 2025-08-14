<?php

namespace App\DTO;

use App\Entity\RedisOutbox;
use DateTimeImmutable;
use Exception;

readonly class RedisOutboxDTO
{
    public function __construct(
        public string $eventType,
        public string $payload,
        public ?DateTimeImmutable $createdAt = null,
        public bool $published = false,
        public ?int $id = null
    ) {
    }

    public static function fromEntity(RedisOutbox $outbox): self
    {
        return new self(
            eventType: $outbox->getEventType(),
            payload: $outbox->getPayload(),
            createdAt: $outbox->getCreatedAt(),
            published: $outbox->isPublished(),
            id: $outbox->getId()
        );
    }

    /**
     * Convert DTO to an array
     *
     * @return array{
     *     id: int|null,
     *     event_type: string,
     *     payload: string,
     *     created_at: string,
     *     published: bool
     * }
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'event_type' => $this->eventType,
            'payload' => $this->payload,
            'created_at' => $this->createdAt?->format('Y-m-d\TH:i:s\Z'),
            'published' => $this->published
        ];
    }

    /**
     * Create DTO from array data
     *
     * @param array{
     *     event_type: string,
     *     payload: string,
     *     created_at?: string,
     *     published?: bool,
     *     id?: int
     * } $data
     * @return self
     * @throws Exception
     */
    public static function fromArray(array $data): self
    {
        return new self(
            eventType: $data['event_type'],
            payload: $data['payload'],
            createdAt: isset($data['created_at'])
                ? new DateTimeImmutable($data['created_at'])
                : null,
            published: $data['published'] ?? false,
            id: $data['id'] ?? null
        );
    }
}
