from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Role(models.TextChoices):
        CASHIER = "CA", "Cashier"
        WAITER = "WA", "Waiter"
        CHEF = "CH", "Chef"
        ADMINISTRATOR = "AD", "Administrator"
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=2, choices=Role.choices)
    created_at = models.DateTimeField(auto_now_add=True)