from rest_framework import permissions
from ERP.models import application , permission as erp_permission
from django.core.exceptions import PermissionDenied

class isAdmin(permissions.BasePermission):
    """Allow the Admin only"""
    def has_object_permission(self, request , view , obj):
        return request.user.is_superuser
class isOwner(permissions.BasePermission):
    """Allow the Admin only"""
    def has_object_permission(self, request , view , obj):
        return obj.user == request.user
class isAdminOrReadOnly(permissions.BasePermission):
    """Allow the Admin only"""
    def has_object_permission(self, request , view , obj):
        if request.method in 'GET':
            # Check permissions for read-only request
            return True
        else:
            return request.user.is_superuser
            # Check permissions for write request

class readOnly(permissions.BasePermission):

    def has_object_permission(self, request , view , obj):
        if request.method in 'GET':
            # Check permissions for read-only request
            return True
        else:
            return False
            # Check permissions for write request

class isOwnerOrReadOnly(permissions.BasePermission):

    def has_object_permission(self, request , view , obj):
        if request.method in 'GET':
            # Check permissions for read-only request
            return True
        else:
            return obj.user == request.user
            # Check permissions for write request

def has_application_permission(user , apps):
    a = application.objects.filter(name__in = apps)
    p = erp_permission.objects.filter(user = user , app__in = a)
    if p.count() == a.count() or user.is_superuser:
        return True
    else:
        raise PermissionDenied()

def add_application_access(user , perms , by):
    for a in perms:
        app = application.objects.get(name = a)
        p = erp_permission.objects.create(app =  app, user = user , givenBy = by)
