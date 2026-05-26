from rest_framework import serializers
from ..models import OrderItem, Order, Payment
from ...menu.models import MenuItem
from ...tables.models import Table

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ["id", "name", "price"]

class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = "__all__"

class OrderItemWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["menu_item", "quantity"]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value

class OrderItemReadSerializer(serializers.ModelSerializer):
    menu_item = MenuItemSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ["menu_item", "quantity"]
    
class OrderResponseSerializer(serializers.ModelSerializer):
    items = OrderItemReadSerializer(many=True, read_only=True)
    table = TableSerializer(read_only=True)
    status = serializers.CharField(source='get_status_display')
    order_type = serializers.CharField(source="get_order_type_display")

    class Meta:
        model = Order
        fields = "__all__"

class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemWriteSerializer(many=True)

    class Meta:
        model = Order
        fields = ["items", "table", "order_type"]
        extra_kwargs = {
            "table": {"required": False, "allow_null": True},
            "order_type": {"required": False}
        }

    def validate(self, data):
        order_type = data.get("order_type", Order.OrderType.DINE_IN)
        table = data.get("table")
        items = data.get("items", [])

        if not items:
            raise serializers.ValidationError({"items": "Order must contain at least one item."})

        if order_type == Order.OrderType.DINE_IN and table is None:
            raise serializers.ValidationError({"table": "Table is required for a dine-in order"})
        
        if order_type == Order.OrderType.TAKEAWAY and table is not None:
            raise serializers.ValidationError({"table": "Table is not required for a takeaway order."})
        
        return data
    
class PaymentSerializer(serializers.Serializer):
    payment_method = serializers.ChoiceField(choices=Payment.PaymentMethod.choices)