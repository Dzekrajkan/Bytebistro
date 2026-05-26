from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiParameter
from django.shortcuts import get_object_or_404
from core.view import PosApiView, PosOrderApiView
from core.schemas import ActionResponseSchema
from core.permissions import IsAdmin, IsAdminOrCashier, IsAdminOrChef, IsAdminOrWaiter
from .serializers import OrderCreateSerializer, OrderResponseSerializer, PaymentSerializer
from ..services import create_order, order_pay, order_ready, order_complete, order_cancel
from ..selectors import get_daily_report
from ..models import Order

class OrderPagination(PageNumberPagination):
    page_size=6
    page_size_query_param="page_size"
    max_page_size=500

class OrderApiView(PosApiView):
    permission_classes_by_method = {
        "GET": [IsAdminOrChef],
        "POST": [IsAdminOrCashier],
    }

    @extend_schema(
        request=None,
        responses=OrderResponseSerializer(many=True),
        parameters=[
            OpenApiParameter(
                name="status",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                many=True,
                explode=True,
                enum=[Order.Status.Created, Order.Status.Ready, Order.Status.Completed, Order.Status.Cancelled, Order.Status.SentToKitchen],
                description="Status filter (multiple selection)"
            )
        ]
    )

    def get(self, request):
        status_filter = request.query_params.getlist("status")
        orders = Order.objects.select_related("table").prefetch_related("items__menu_item").order_by("pk")

        if status_filter:
            orders = orders.filter(status__in=status_filter)

        paginator = OrderPagination()
        page = paginator.paginate_queryset(orders, request)

        return paginator.get_paginated_response(
            OrderResponseSerializer(page, many=True).data,
        )

    @extend_schema(
        request=OrderCreateSerializer,
        responses={201: OrderResponseSerializer}
    )

    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            order = create_order(
                table=serializer.validated_data.get("table"),
                items=serializer.validated_data["items"],
                order_type=serializer.validated_data.get("order_type", Order.OrderType.DINE_IN)
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            OrderResponseSerializer(order).data,
            status=status.HTTP_201_CREATED
        )
    
class OrderDetail(APIView):
    permission_classes=[IsAdmin]

    @extend_schema(
        request=None,
        responses=OrderResponseSerializer
    )

    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk)

        return Response(
            OrderResponseSerializer(order).data,
            status=status.HTTP_200_OK
        )
    
    @extend_schema(
        responses=None
    )

    def delete(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        order.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
    
class DailySalesChartView(APIView):
    permission_classes=[IsAdmin]

    @extend_schema(
        responses=OpenApiTypes.OBJECT
    )

    def get(self, request):

        return Response(get_daily_report())
    
class OrderPay(APIView):
    permission_classes=[IsAdminOrCashier]

    @extend_schema(
        request=PaymentSerializer,
        responses=ActionResponseSchema
    )

    def post(self, request, pk):
        serializer = PaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            order_pay(pk, serializer.validated_data["payment_method"])
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_409_CONFLICT)
        
        return Response({"message": "ok"}, status=status.HTTP_200_OK)
    
class OrderReady(PosOrderApiView):
    permission_classes=[IsAdminOrChef]
    _action = staticmethod(order_ready)
    
class OrderCompleted(PosOrderApiView):
    permission_classes=[IsAdminOrWaiter]
    _action = staticmethod(order_complete)
    
class OrderCancel(PosOrderApiView):
    permission_classes=[IsAdminOrChef]
    _action = staticmethod(order_cancel)