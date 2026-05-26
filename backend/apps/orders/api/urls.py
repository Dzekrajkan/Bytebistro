from django.urls import path
from .views import OrderApiView, OrderDetail, DailySalesChartView, OrderPay, OrderReady, OrderCompleted, OrderCancel

urlpatterns = [
    path("orders/", OrderApiView.as_view()),
    path("orders/<int:pk>/", OrderDetail.as_view()),
    path("reports/daily/", DailySalesChartView.as_view()),
    path("orders/<int:pk>/pay/", OrderPay.as_view()),
    path("orders/<int:pk>/ready/", OrderReady.as_view()),
    path("orders/<int:pk>/completed/", OrderCompleted.as_view()),
    path("orders/<int:pk>/cancel/", OrderCancel.as_view()),
]