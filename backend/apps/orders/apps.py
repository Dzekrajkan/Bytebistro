from django.apps import AppConfig
from utils.redis_client import is_redis_available
import os

class OrdersConfig(AppConfig):
    name = "apps.orders"

    def ready(self):
        if os.environ.get("RUN_MAIN") != "true":
            return
        if is_redis_available():
            print("✅ Redis is connected")
        else:
            print("⚠️  Redis is unavailable, the database will be used instead")