from django.db.models.functions import TruncHour
from django.db.models import Sum, Count
from django.utils import timezone
from .models import Payment
from utils.redis_client import get_or_fetch

METHOD_MAP = {
    Payment.PaymentMethod.CASH: "cash",
    Payment.PaymentMethod.CARD: "card",
}

def get_daily_report():
    today = timezone.now().date()
    cache_key = f"daily_report:{today}"

    def fetch():
        data = Payment.objects.filter(created_at__date=today).annotate(hour=TruncHour("created_at")).values("hour", "payment_method").annotate(total=Sum("amount"), count=Count("id")).order_by("hour")

        chart = {}
        for row in data:
            hour_str = row["hour"].strftime("%H:00")
            if hour_str not in chart:
                chart[hour_str] = {"time": hour_str, "cash": 0, "card": 0, "cash_count": 0, "card_count": 0}
            method = METHOD_MAP.get(row["payment_method"])
            if method:
                chart[hour_str][method] = float(row["total"] or 0)
                chart[hour_str][f"{method}_count"] = row["count"]

        return list(chart.values())
    
    return get_or_fetch(cache_key, fetch, timeout=60)