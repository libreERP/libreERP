from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the snippet.
        return obj.owner == request.user

class isAdmin(permissions.BasePermission):
    """Allow the Admin only"""
    def has_object_permission(self, request , view , obj):
        return request.user.is_superuser

class readOnly(permissions.BasePermission):

    def has_object_permission(self, request , view , obj):
        if request.method in 'GET':
            # Check permissions for read-only request
            return True
        else:
            return False
            # Check permissions for write request
