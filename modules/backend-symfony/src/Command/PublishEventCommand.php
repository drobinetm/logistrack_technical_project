<?php

namespace App\Command;

use App\Enum\OrderStatus;
use App\Repository\OrderRepository;
use App\Repository\RedisOutboxRepository;
use App\Service\EventPublisher;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\ChoiceQuestion;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Messenger\Exception\ExceptionInterface;
use JsonException;


#[AsCommand(
    name: 'app:publish-event',
    description: 'Add a short description for your command',
)]
class PublishEventCommand extends Command
{
    private EventPublisher $publisher;
    private OrderRepository $orderRepository;
    private RedisOutboxRepository $redisOutboxRepository;

    public function __construct(EventPublisher $publisher, OrderRepository $orderRepository, RedisOutboxRepository $redisOutboxRepository)
    {
        parent::__construct();

        $this->publisher = $publisher;
        $this->orderRepository = $orderRepository;
        $this->redisOutboxRepository = $redisOutboxRepository;
    }

    /**
     * @throws JsonException
     * @throws ExceptionInterface
     */
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        // Get all order IDs from RedisOutbox
        $redisOrdersPublished = $this->redisOutboxRepository->findOrderPublishedIdsFromPayloads();

        // Get all consolidated orders from the database
        $consolidatedOrders = $this->orderRepository->findBy(['status' => OrderStatus::APPROVED]);

        if (!$consolidatedOrders) {
            $output->writeln('<error>No existen bloques consolidados para distribuir</error>');
            return Command::FAILURE;
        }

        // Create a list of choices for the question
        $choices = [];
        foreach ($consolidatedOrders as $order) {
            if (in_array($order->getId(), $redisOrdersPublished, true)) {
                continue;
            }

            // Add the order to the list of choices
            $choices[] = "{$order->getId()} - Bloque: {$order->getBlock()->getName()} - Origen: {$order->getOrigin()} - Destino: {$order->getDestination()}";
        }

        // Create a question and ask the user for input
        $helper = $this->getHelper('question');
        $question = new ChoiceQuestion(
            'Seleccione un bloque consolidado por número (default 0)',
            $choices,
            0
        );
        $question->setErrorMessage('La opción %s no es válida.');

        // Get the id selected by the user and output it
        $selected = $helper->ask($input, $output, $question);
        [$id] = explode(' - ', $selected);

        // Get the order from the database
        $order = $this->orderRepository->find($id);

        if (!$order) {
            $output->writeln('<error>El bloque seleccionado no existe</error>');
            return Command::FAILURE;
        }

        // Get the payload for the event
        $type = "consolidated.blocks.ready.distribution";
        $payload = $order->getConsolidatedOrderPayload();
        $this->publisher->publish($type, $payload);

        $output->writeln("<info>Event '$type' published in backend django</info>");
        $output->writeln(json_encode($payload, JSON_PRETTY_PRINT));

        return Command::SUCCESS;
    }
}
