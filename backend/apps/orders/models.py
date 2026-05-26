from django.db import models
from ..tables.models import Table
from ..menu.models import MenuItem

class Order(models.Model):
    class Status(models.TextChoices):
        Created = "CR", "Created"
        SentToKitchen = "S", "Sent to kitchen"
        Ready = "R", "Ready"
        Completed = "CO", "Completed"
        Cancelled = "CA", "Cancelled"
    class OrderType(models.TextChoices):
        DINE_IN = "DI", "Dine In"
        TAKEAWAY = "TA", "Take Away"
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name="orders", null=True, blank=True)
    status = models.CharField(default=Status.Created, max_length=2, choices=Status.choices, db_index=True)
    order_type = models.CharField(max_length=2, choices=OrderType.choices, default=OrderType.DINE_IN)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name="order_items")
    quantity = models.IntegerField()
    price_at_moment = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

class Payment(models.Model):
    class PaymentMethod(models.TextChoices):
        CASH = "CS", "Cash"
        CARD = "CR", "Card"
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="payment")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=2, choices=PaymentMethod.choices)
    created_at = models.DateTimeField(auto_now_add=True)