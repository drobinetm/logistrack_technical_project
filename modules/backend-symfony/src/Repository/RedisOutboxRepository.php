<?php

namespace App\Repository;

use App\Entity\RedisOutbox;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use JsonException;


/**
 * @extends ServiceEntityRepository<RedisOutbox>
 */
class RedisOutboxRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, RedisOutbox::class);
    }

    /**
     * Get all order IDs that have been published
     *
     * @return int[] Array of order IDs
     * @throws JsonException
     */
    public function findOrderPublishedIdsFromPayloads(): array
    {
        $orderIds = [];

        $outboxes = $this->findBy(["published" => true]);

        foreach ($outboxes as $outbox) {
            $payload = json_decode($outbox->getPayload(), true, 512, JSON_THROW_ON_ERROR);

            if (isset($payload['order_id']) && is_numeric($payload['order_id'])) {
                $orderId = (int)$payload['order_id'];

                if (!in_array($orderId, $orderIds, true)) {
                    $orderIds[] = $orderId;
                }
            }
        }

        return $orderIds;
    }
}
