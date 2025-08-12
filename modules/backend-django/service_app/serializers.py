from rest_framework import serializers

from .models import Block, Driver, Order, OrderStatus, Product


class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = ["id", "name", "email", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class BlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Block
        fields = ["id", "name", "description", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "sku", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class OrderSerializer(serializers.ModelSerializer):
    # Use PKs for write operations; can be swapped to nested if needed
    driver = serializers.PrimaryKeyRelatedField(
        queryset=Driver.objects.all(), allow_null=True, required=False
    )
    block = serializers.PrimaryKeyRelatedField(
        queryset=Block.objects.all(), allow_null=True, required=False
    )
    products = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), many=True, required=False
    )
    status = serializers.ChoiceField(
        choices=OrderStatus.choices, default=OrderStatus.PENDING
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "code",
            "driver",
            "block",
            "products",
            "origin",
            "destination",
            "latitude",
            "longitude",
            "dispatch_date",
            "user",
            "volume",
            "weight",
            "incidents",
            "number_of_bags",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
