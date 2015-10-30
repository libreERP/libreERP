from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'users' , UserViewSet , base_name = 'user')
router.register(r'userProfile' , userProfileViewSet , base_name ='userprofile')
router.register(r'userDesignation' , userDesignationViewSet , base_name = 'userdesignation')
router.register(r'groups' , GroupViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
]
