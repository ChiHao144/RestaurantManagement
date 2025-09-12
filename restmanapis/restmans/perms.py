from rest_framework import permissions
from .models import User

class IsReviewOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, review):
        return super().has_permission(request, view) and request.user == review.user

class IsWaiterUser(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return request.user.role == User.Role.WAITER

class IsManagerUser(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return request.user.role == User.Role.MANAGER

class IsAdminUser(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return request.user.role == User.Role.ADMIN

class OrPermission(permissions.BasePermission):
    def __init__(self, *perms):
        self.perms = perms

    def has_permission(self, request, view):
        return any(perm().has_permission(request, view) for perm in self.perms)

class IsWaiterOrManagerUser(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return (
            super().has_permission(request, view) and
            request.user.role in [User.Role.WAITER, User.Role.MANAGER]
        )


class IsManagerAdminWaiterOrOwner(permissions.IsAuthenticated):
    """
    Cho phép MANAGER, ADMIN, WAITER thấy tất cả.
    Người dùng thường chỉ thấy dữ liệu của chính họ.
    AnonymousUser bị chặn.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        allowed_roles = [
            User.Role.MANAGER,
            User.Role.ADMIN,
            User.Role.WAITER,
        ]
        if request.user.role in allowed_roles:
            return True
        return obj.user == request.user
