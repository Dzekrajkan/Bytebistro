from rest_framework.permissions import BasePermission
from apps.users.models import User

class RolePermission(BasePermission):
    allowed_role = []

    def has_permission(self, request, view):
        return (request.user.is_authenticated and request.user.role in self.allowed_role)
    
class IsAdmin(RolePermission):
    allowed_role = [User.Role.ADMINISTRATOR]

class IsChef(RolePermission):
    allowed_role = [User.Role.CHEF]

class IsCashier(RolePermission):
    allowed_role = [User.Role.CASHIER]

class IsWaiter(RolePermission):
    allowed_role = [User.Role.WAITER]

class IsAdminOrCashier(RolePermission):
    allowed_role = [User.Role.ADMINISTRATOR, User.Role.CASHIER]

class IsAdminOrWaiter(RolePermission):
    allowed_role = [User.Role.ADMINISTRATOR, User.Role.WAITER]

class IsAdminOrChef(RolePermission):
    allowed_role = [User.Role.ADMINISTRATOR, User.Role.CHEF]