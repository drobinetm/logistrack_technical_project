<?php

namespace App\Entity;

use App\Entity\Traits\TimeStampTrait;
use App\Repository\ProductRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProductRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Product
{
    use TimeStampTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 128)]
    private string $name;

    #[ORM\Column(length: 64, unique: true)]
    private string $sku;

    /** @var Collection<int, Order> */
    #[ORM\ManyToMany(targetEntity: Order::class, mappedBy: 'products')]
    private Collection $orders;

    public function __construct(string $name, string $sku)
    {
        $this->name = $name;
        $this->sku = $sku;
        $this->orders = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getName(): string { return $this->name; }
    public function setName(string $name): self { $this->name = $name; return $this; }

    public function getSku(): string { return $this->sku; }
    public function setSku(string $sku): self { $this->sku = $sku; return $this; }

    /**
     * @return Collection<int, Order>
     */
    public function getOrders(): Collection { return $this->orders; }
}
