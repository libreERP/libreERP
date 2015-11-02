from rest_framework import permissions

class isAdmin(permissions.BasePermission):
    """Allow the Admin only"""
    def has_object_permission(self, request , view , obj):
        return request.user.is_superuser
class isOwner(permissions.BasePermission):
    """Allow the Admin only"""
    def has_object_permission(self, request , view , obj):
        return obj.user == request.user



class readOnly(permissions.BasePermission):

    def has_object_permission(self, request , view , obj):
        if request.method in 'GET':
            # Check permissions for read-only request
            return True
        else:
            return False
            # Check permissions for write request
