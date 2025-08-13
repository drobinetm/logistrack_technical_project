<?php

namespace App\Entity;

use App\Entity\Traits\TimeStampTrait;
use App\Repository\DriverRepository;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DriverRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Driver
{
    use TimeStampTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 128)]
    private string $firstName;

    #[ORM\Column(length: 128)]
    private string $lastName;

    #[ORM\Column(length: 32)]
    private string $licensePlate;

    #[ORM\Column(type: 'date_immutable')]
    private DateTimeImmutable $dateOfBirth;

    /** @var Collection<int, Order> */
    #[ORM\OneToMany(mappedBy: 'driver', targetEntity: Order::class)]
    private Collection $orders;

    public function __construct(string $firstName, string $lastName, string $licensePlate, DateTimeImmutable $dateOfBirth)
    {
        $this->firstName = $firstName;
        $this->lastName = $lastName;
        $this->licensePlate = $licensePlate;
        $this->dateOfBirth = $dateOfBirth;
        $this->orders = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getFirstName(): string { return $this->firstName; }
    public function setFirstName(string $firstName): self { $this->firstName = $firstName; return $this; }

    public function getLastName(): string { return $this->lastName; }
    public function setLastName(string $lastName): self { $this->lastName = $lastName; return $this; }

    public function getLicensePlate(): string { return $this->licensePlate; }
    public function setLicensePlate(string $licensePlate): self { $this->licensePlate = $licensePlate; return $this; }

    public function getDateOfBirth(): DateTimeImmutable { return $this->dateOfBirth; }
    public function setDateOfBirth(DateTimeImmutable $dob): self { $this->dateOfBirth = $dob; return $this; }

    /**
     * @return Collection<int, Order>
     */
    public function getOrders(): Collection { return $this->orders; }

    public function addOrder(Order $order): self
    {
        if (!$this->orders->contains($order)) {
            $this->orders->add($order);
            $order->setDriver($this);
        }
        return $this;
    }

    public function removeOrder(Order $order): self
    {
        if ($this->orders->removeElement($order)) {
            if ($order->getDriver() === $this) {
                $order->setDriver(null);
            }
        }
        return $this;
    }
}
