from rest_framework import serializers
from ..models import Table

class TableCreateSerializer(serializers.Serializer):
    number = serializers.IntegerField()
    seats_count = serializers.IntegerField(min_value=1)
    status = serializers.ChoiceField(choices=Table.Status.choices, default=Table.Status.FREE)

    def validate_number(self, value):
        if Table.objects.filter(number=value).exists():
            raise serializers.ValidationError("Table already exists")
        return value

class TableResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = "__all__"