from rest_framework import status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from django.shortcuts import get_object_or_404
from core.view import PosApiView
from .serializers import CategorySerializer, MenuItemCreateSerializer, MenuItemResponseSerializer
from ..models import Category, MenuItem

class CategoryApiView(PosApiView):

    @extend_schema(
        responses=CategorySerializer(many=True)
    )

    def get(self, request):
        categories = Category.objects.all()

        return Response(
            CategorySerializer(categories, many=True).data,
            status=status.HTTP_200_OK
        )

    @extend_schema(
        request=CategorySerializer,
        responses={201: CategorySerializer}
    )

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        category = Category.objects.create(
            name=serializer.validated_data["name"],
            is_active=serializer.validated_data["is_active"]
        )

        return Response(
            CategorySerializer(category).data,
            status=status.HTTP_201_CREATED
        )
    
class CategoryDetail(PosApiView):

    @extend_schema(
        responses=CategorySerializer
    )

    def get(self, request, pk):
        category = get_object_or_404(Category, pk=pk)

        return Response(
            CategorySerializer(category).data,
            status=status.HTTP_200_OK
        )

    @extend_schema(
        responses=None
    )

    def delete(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        category.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
    
class MenuItemApiView(PosApiView):

    @extend_schema(
        responses=MenuItemResponseSerializer(many=True)
    )

    def get(self, request):
        menu_items = MenuItem.objects.all()

        return Response(
            MenuItemResponseSerializer(menu_items, many=True).data,
            status=status.HTTP_200_OK
        )
    
    @extend_schema(
        request=MenuItemCreateSerializer,
        responses={201: MenuItemResponseSerializer}
    )

    def post(self, request):
        serializer = MenuItemCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        menu_item = MenuItem.objects.create(
            category=serializer.validated_data["category_id"],
            name=serializer.validated_data["name"],
            description=serializer.validated_data["description"],
            price=serializer.validated_data["price"],
            is_available=serializer.validated_data["is_available"]
        )

        return Response(
            MenuItemResponseSerializer(menu_item).data,
            status=status.HTTP_201_CREATED
        )
    
class MenuItemDetail(PosApiView):

    @extend_schema(
        responses=MenuItemResponseSerializer
    )

    def get(self, request, pk):
        menu_item = get_object_or_404(MenuItem, pk=pk)

        return Response(
            MenuItemResponseSerializer(menu_item).data,
            status=status.HTTP_200_OK
        )

    @extend_schema(
        responses=None
    )

    def delete(self, request, pk):
        menu_item = get_object_or_404(MenuItem, pk=pk)
        menu_item.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)