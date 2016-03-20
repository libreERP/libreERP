from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'repoPermission' , repoPermissionViewSet , base_name = 'repoPermission')
router.register(r'groupPermission' , groupPermissionViewSet , base_name = 'groupPermission')
router.register(r'repo' , repoViewSet , base_name = 'repo')

urlpatterns = [
    url(r'^', include(router.urls)),
]
