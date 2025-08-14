<?php

namespace App\Service;

use App\DTO\RedisOutboxDTO;
use App\Factory\RedisOutboxFactory;
use App\Message\EventMessage;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Messenger\Exception\ExceptionInterface;
use Symfony\Component\Messenger\MessageBusInterface;
use Exception;

readonly class EventPublisher
{
    public function __construct(
        private MessageBusInterface $bus,
        private EntityManagerInterface $entityManager,
        private RedisOutboxFactory $redisOutboxFactory
    ) {}

    /**
     * Mark a RedisOutbox entry as published
     *
     * @throws Exception
     */
    public function markAsPublished(string $type, array $data): void
    {
        $redisOutboxDto = new RedisOutboxDTO($type, json_encode($data));

        $outbox = $this->redisOutboxFactory->createFromDTO($redisOutboxDto);
        $outbox->markPublished();

        $this->entityManager->persist($outbox);
        $this->entityManager->flush();
    }

    /**
     * Publish an event to the message bus
     *
     * @throws ExceptionInterface
     * @throws Exception
     */
    public function publish(string $type, array $data): void
    {
        // Publish the event
        $message = new EventMessage($type, $data);
        $this->bus->dispatch($message);

        // Mark the event as published
        $this->markAsPublished($type, $data);
    }
}
