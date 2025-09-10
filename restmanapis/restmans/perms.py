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

