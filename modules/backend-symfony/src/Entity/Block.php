<?php

namespace App\Entity;

use App\Entity\Traits\TimeStampTrait;
use App\Repository\BlockRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: BlockRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Block
{
    use TimeStampTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 128, unique: true)]
    private string $name;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    /** @var Collection<int, Order> */
    #[ORM\OneToMany(mappedBy: 'block', targetEntity: Order::class)]
    private Collection $orders;

    public function __construct(string $name)
    {
        $this->name = $name;
        $this->orders = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getName(): string { return $this->name; }
    public function setName(string $name): self { $this->name = $name; return $this; }

    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): self { $this->description = $description; return $this; }

    /**
     * @return Collection<int, Order>
     */
    public function getOrders(): Collection { return $this->orders; }
}
