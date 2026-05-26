from rest_framework_simplejwt.authentication import JWTAuthentication
from drf_spectacular.extensions import OpenApiAuthenticationExtension

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get("access")

        if not access_token:
            return None
        
        try:
            validated_token = self.get_validated_token(access_token)
        except Exception:
            return None
        
        return self.get_user(validated_token), validated_token
    
class CookieJWTAuthenticationExtension(OpenApiAuthenticationExtension):
    target_class = CookieJWTAuthentication
    name = "CookieJWT"

    def get_security_definition(self, auto_schema):
        return {
            "type": "apiKey",
            "in": "cookie",
            "name": "access",
        }