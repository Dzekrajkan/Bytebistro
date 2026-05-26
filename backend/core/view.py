from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from core.schemas import ActionResponseSchema
from drf_spectacular.utils import extend_schema
from core.permissions import IsAdmin
from rest_framework.response import Response
from rest_framework import status

class PosApiView(APIView):
    permission_classes_by_method = {
        "GET": [AllowAny],
        "POST": [IsAdmin],
        "PUT": [IsAdmin],
        "PATCH": [IsAdmin],
        "DELETE": [IsAdmin]
    }

    def get_permissions(self):
        method = self.request.method
        perms = self.permission_classes_by_method.get(method, [AllowAny])
        return [perm() for perm in perms]
    
class PosOrderApiView(APIView):
    _action = None

    @extend_schema(
        request=None,
        responses=ActionResponseSchema
    )

    def post(self, request, pk):
        try:
            self._action(pk)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_409_CONFLICT)

        return Response({"message": "ok"}, status=status.HTTP_200_OK)