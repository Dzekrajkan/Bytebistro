from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema
from django_ratelimit.decorators import ratelimit
from core.permissions import IsAdmin
from .serializers import UserResponseSerializer, LoginSerializer, LoginResponseSerializer, CreateUserSerializer, UserPatchSerializer
from ..services import create_user
from ..models import User

class CookieTokenRefreshView(TokenRefreshView):

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh")

        if not refresh_token:
            return Response({"detail": "No refresh token cookie"}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data={"refresh": refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except (TokenError, InvalidToken, ValidationError):
            return Response({"detail": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)
        data = serializer.validated_data

        response = Response({"message": "ok"}, status=status.HTTP_200_OK)

        access = data.get("access")
        response.set_cookie(
            key="access",
            value=access,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=60 * 15
        )
    
        return response
    
class Me(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=None,
        responses=UserResponseSerializer
    )

    def get(self, request):
        pk = request.user.id
        user = get_object_or_404(User, pk=pk)
        serializer = UserResponseSerializer(user)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
    
class Login(APIView):
    
    @extend_schema(
        request=LoginSerializer,
        responses=LoginResponseSerializer
    )

    @method_decorator(ratelimit(key="ip", rate="5/m", method="POST", block=True))
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user=user)

        response = Response({"message": "ok"}, status=status.HTTP_200_OK)

        response.set_cookie(
            key="access",
            value=str(refresh.access_token),
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=60 * 15   
        )

        response.set_cookie(
            key="refresh",
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=60 * 60 * 24 * 7
        )

        return response

class Users(APIView):
    permission_classes=[IsAdmin]

    @extend_schema(
        responses=UserResponseSerializer(many=True)
    )

    def get(self, request):
        users = User.objects.all()

        if not users:
            return Response({"detail": "There are no users"}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(
            UserResponseSerializer(users, many=True).data,
            status=status.HTTP_200_OK
        )

    @extend_schema(
        request=CreateUserSerializer,
        responses={201: OpenApiTypes.OBJECT}
    )

    def post(self, request):
        serializer = CreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        create_user(
            username=serializer.validated_data["username"],
            email=serializer.validated_data["email"],
            role=serializer.validated_data["role"],
            password=serializer.validated_data["password1"]
        )

        return Response({"message": "ok"}, status=status.HTTP_201_CREATED)
    
class UserDetail(APIView):
    permission_classes=[IsAdmin]
    
    @extend_schema(
        responses=UserResponseSerializer
    )

    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        
        return Response(
            UserResponseSerializer(user).data,
            status=status.HTTP_200_OK
        )
    
    @extend_schema(
        request=UserPatchSerializer,
        responses=UserResponseSerializer
    )
    
    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)

        serializer = UserPatchSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
    
    @extend_schema(
        responses=None
    )
    
    def delete(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
    
class Logout(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=None,
        responses=None
    )

    def post(self, request):
        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie(key="access")
        response.delete_cookie(key="refresh")

        return response