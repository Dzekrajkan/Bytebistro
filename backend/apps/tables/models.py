from django.db import models

class Table(models.Model):
    class Status(models.TextChoices):
        FREE = "F", "Free"
        OCCUPIED = "O", "Occupied"
        RESERVED = "R", "Reserved"
        CLOSED = "C", "Closed"
    number = models.IntegerField(unique=True)
    seats_count = models.IntegerField()
    status = models.CharField(max_length=1, choices=Status.choices, default=Status.FREE)
    created_at = models.DateTimeField(auto_now_add=True)