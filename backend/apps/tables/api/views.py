from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema 
from django.shortcuts import get_object_or_404
from core.view import PosApiView
from core.permissions import IsAdminOrCashier, IsAdminOrWaiter
from .serializers import TableCreateSerializer, TableResponseSerializer
from ..services import reserve_table, free_table
from ..models import Table

class Tables(PosApiView):
    
    @extend_schema(
        request=TableCreateSerializer,
        responses=TableResponseSerializer(many=True)
    )

    def get(self, request):
        table = Table.objects.all()

        return Response(
            TableResponseSerializer(table, many=True).data,
            status=status.HTTP_200_OK
        )
    
    @extend_schema(
        request=TableCreateSerializer,
        responses={201: TableResponseSerializer}
    )

    def post(self, request):
        serializer = TableCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        table = Table.objects.create(
            number=serializer.validated_data["number"],
            seats_count=serializer.validated_data["seats_count"],
            status=serializer.validated_data["status"]
        )

        return Response(
            TableResponseSerializer(table).data,
            status=status.HTTP_201_CREATED
        )
    
class TableDetail(PosApiView):

    @extend_schema(
        responses=TableResponseSerializer,
    )

    def get(self, request, pk):
        table = get_object_or_404(Table, pk=pk)
        
        return Response(
            TableResponseSerializer(table).data,
            status=status.HTTP_200_OK
        )
    
    @extend_schema(
        responses=None
    )

    def delete(self, request, pk):
        table = get_object_or_404(Table, pk=pk)
        table.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
    
class TableFree(APIView):
    permission_classes=[IsAdminOrWaiter]

    @extend_schema(
        request=None,
        responses=TableResponseSerializer
    )

    def post(self, request, pk):
        try:
            table = free_table(pk)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(
            TableResponseSerializer(table).data,
            status=status.HTTP_200_OK
        )
    
class TableReserve(APIView):
    permission_classes=[IsAdminOrCashier]

    @extend_schema(
        request=None,
        responses=TableResponseSerializer
    )

    def post(self, request):
        try:
            table = reserve_table()
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(
            TableResponseSerializer(table).data,
            status=status.HTTP_200_OK
        )