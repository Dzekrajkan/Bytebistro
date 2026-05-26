from rest_framework import serializers
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class CreateUserSerializer(serializers.Serializer):
    class Role(models.TextChoices):
        CASHIER = "CA", "Cashier"
        WAITER = "WA", "Waiter"
        CHEF = "CH", "Chef"
        ADMINISTRATOR = "AD", "Administrator"
    username = serializers.CharField(min_length=4)
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=Role.choices)
    password1 = serializers.CharField(min_length=8)
    password2 = serializers.CharField(min_length=8)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username is busy")
        return value
        
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is busy")
        return value

    def validate(self, data):
        if data["password1"] != data["password2"]:
            raise serializers.ValidationError("Passwords do not match")
        return data
    
class UserPatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "role"]
    
class UserResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "created_at"]
    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data["email"]
        password = data["password"]

        user = User.objects.filter(email=email).first()
        if not user:
            raise serializers.ValidationError("User does not exist")
        if not user.check_password(password):
            raise serializers.ValidationError("Incorrect password")
        
        data["user"] = user
        return data
    
class LoginResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    access = serializers.CharField()
    refresh = serializers.CharField()