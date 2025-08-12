from django.db import models


class TimeStampedModel(models.Model):
    """Abstract base model with created/updated timestamps."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class OrderStatus(models.TextChoices):
    COMPLETED = "COMPLETED", "Completed"
    PENDING = "PENDING", "Pending"
    REJECTED = "REJECTED", "Rejected"
    DELIVERED = "DELIVERED", "Delivered"
    READY_TO_SHIP = "READY_TO_SHIP", "Ready to ship"
    IN_DISPATCH = "IN_DISPATCH", "In dispatch"
    APPROVED = "APPROVED", "Approved"
    READY_TO_DELIVER = "READY_TO_DELIVER", "Ready to deliver"


class Driver(TimeStampedModel):
    """Represents a driver who can handle multiple orders."""

    name = models.CharField(max_length=128)
    email = models.EmailField(max_length=254, blank=True, null=True)

    def __str__(self) -> str:
        return f"{self.name}"


class Block(TimeStampedModel):
    """A logical grouping/area that contains many orders."""

    name = models.CharField(max_length=128, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self) -> str:
        return f"{self.name}"


class Product(TimeStampedModel):
    """A product that can be assigned to several orders."""

    name = models.CharField(max_length=128)
    sku = models.CharField(max_length=64, unique=True)

    def __str__(self) -> str:
        return f"{self.name} ({self.sku})"


class Order(TimeStampedModel):
    """Represents an order with relationships to Driver, Block, and Products."""

    code = models.CharField(max_length=64, unique=True)

    # Relations
    driver = models.ForeignKey(
        Driver, on_delete=models.SET_NULL, related_name="orders", null=True, blank=True
    )
    block = models.ForeignKey(
        Block, on_delete=models.SET_NULL, related_name="orders", null=True, blank=True
    )
    products = models.ManyToManyField(Product, related_name="orders", blank=True)

    # Attributes
    origin = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, blank=True, null=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, blank=True, null=True
    )
    dispatch_date = models.DateTimeField(blank=True, null=True)
    user = models.CharField(max_length=128)
    volume = models.DecimalField(
        max_digits=10, decimal_places=2, help_text="Cubic volume", blank=True, null=True
    )
    weight = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Weight in kilograms",
        blank=True,
        null=True,
    )
    incidents = models.TextField(blank=True, null=True)
    number_of_bags = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=32, choices=OrderStatus.choices, default=OrderStatus.PENDING
    )

    def __str__(self) -> str:
        return f"{self.code}"
