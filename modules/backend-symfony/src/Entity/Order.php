<?php

namespace App\Entity;

use App\Entity\Traits\TimeStampTrait;
use App\Enum\OrderStatus;
use App\Repository\OrderRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: OrderRepository::class)]
#[ORM\Table(name: '`order`')]
#[ORM\HasLifecycleCallbacks]
class Order
{
    use TimeStampTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 64, unique: true)]
    private string $code;

    #[ORM\ManyToOne(targetEntity: Driver::class, inversedBy: 'orders')]
    #[ORM\JoinColumn(onDelete: 'SET NULL', nullable: true)]
    private ?Driver $driver = null;

    #[ORM\ManyToOne(targetEntity: Block::class, inversedBy: 'orders')]
    #[ORM\JoinColumn(onDelete: 'SET NULL', nullable: true)]
    private ?Block $block = null;

    /** @var Collection<int, Product> */
    #[ORM\ManyToMany(targetEntity: Product::class, inversedBy: 'orders')]
    #[ORM\JoinTable(name: 'order_products')]
    private Collection $products;

    #[ORM\Column(length: 255)]
    private string $origin;

    #[ORM\Column(length: 255)]
    private string $destination;

    #[ORM\Column(type: 'decimal', precision: 9, scale: 6, nullable: true)]
    private ?string $latitude = null;

    #[ORM\Column(type: 'decimal', precision: 9, scale: 6, nullable: true)]
    private ?string $longitude = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $dispatchDate = null;

    #[ORM\Column(length: 128)]
    private string $user;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2, nullable: true, options: ['comment' => 'Cubic volume'])]
    private ?string $volume = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2, nullable: true, options: ['comment' => 'Weight in kilograms'])]
    private ?string $weight = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $incidents = null;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private int $numberOfBags = 0;

    #[ORM\Column(type: 'string', enumType: OrderStatus::class, length: 32)]
    private OrderStatus $status = OrderStatus::PENDING;

    public function __construct(string $code, string $origin, string $destination, string $user)
    {
        $this->code = $code;
        $this->origin = $origin;
        $this->destination = $destination;
        $this->user = $user;
        $this->products = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getCode(): string { return $this->code; }
    public function setCode(string $code): self { $this->code = $code; return $this; }

    public function getDriver(): ?Driver { return $this->driver; }
    public function setDriver(?Driver $driver): self { $this->driver = $driver; return $this; }

    public function getBlock(): ?Block { return $this->block; }
    public function setBlock(?Block $block): self { $this->block = $block; return $this; }

    /**
     * @return Collection<int, Product>
     */
    public function getProducts(): Collection { return $this->products; }

    public function addProduct(Product $product): self
    {
        if (!$this->products->contains($product)) {
            $this->products->add($product);
        }
        return $this;
    }

    public function removeProduct(Product $product): self
    {
        $this->products->removeElement($product);
        return $this;
    }

    public function getOrigin(): string { return $this->origin; }
    public function setOrigin(string $origin): self { $this->origin = $origin; return $this; }

    public function getDestination(): string { return $this->destination; }
    public function setDestination(string $destination): self { $this->destination = $destination; return $this; }

    public function getLatitude(): ?string { return $this->latitude; }
    public function setLatitude(?string $latitude): self { $this->latitude = $latitude; return $this; }

    public function getLongitude(): ?string { return $this->longitude; }
    public function setLongitude(?string $longitude): self { $this->longitude = $longitude; return $this; }

    public function getDispatchDate(): ?\DateTimeImmutable { return $this->dispatchDate; }
    public function setDispatchDate(?\DateTimeImmutable $dispatchDate): self { $this->dispatchDate = $dispatchDate; return $this; }

    public function getUser(): string { return $this->user; }
    public function setUser(string $user): self { $this->user = $user; return $this; }

    public function getVolume(): ?string { return $this->volume; }
    public function setVolume(?string $volume): self { $this->volume = $volume; return $this; }

    public function getWeight(): ?string { return $this->weight; }
    public function setWeight(?string $weight): self { $this->weight = $weight; return $this; }

    public function getIncidents(): ?string { return $this->incidents; }
    public function setIncidents(?string $incidents): self { $this->incidents = $incidents; return $this; }

    public function getNumberOfBags(): int { return $this->numberOfBags; }
    public function setNumberOfBags(int $n): self { $this->numberOfBags = $n; return $this; }

    public function getStatus(): OrderStatus { return $this->status; }
    public function setStatus(OrderStatus $status): self { $this->status = $status; return $this; }
}
