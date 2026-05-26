from drf_spectacular.utils import inline_serializer
from rest_framework import serializers

ActionResponseSchema = inline_serializer(
    name="ActionResponse",
    fields={"message": serializers.CharField()}
)