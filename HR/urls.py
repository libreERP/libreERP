from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'users' , UserViewSet , base_name = 'user')
router.register(r'groups' , GroupViewSet)
router.register(r'usersAdminMode' , userAdminViewSet , base_name = 'userAdminMode')
router.register(r'userSearch' , UserSearchViewSet , base_name = 'userSearch')
router.register(r'profile' , userProfileViewSet , base_name ='profile')
router.register(r'profileAdminMode' , userProfileAdminModeViewSet , base_name ='profileAdminMode')
router.register(r'designation' , userDesignationViewSet , base_name = 'designation')
router.register(r'rank' , rankViewSet , base_name = 'rank')
router.register(r'module' , moduleViewSet , base_name = 'module')
router.register(r'application' , applicationViewSet , base_name = 'application')
router.register(r'applicationAdminMode' , applicationAdminViewSet , base_name = 'applicationAdminMode')
router.register(r'appSettings' , applicationSettingsViewSet , base_name = 'applicationSettings')
router.register(r'appSettingsAdminMode' , applicationSettingsAdminViewSet , base_name = 'applicationSettingsAdminMode')
router.register(r'groupPermission' , groupPermissionViewSet , base_name = 'groupAccess')
router.register(r'permission' , permissionViewSet , base_name = 'access')

urlpatterns = [
    url(r'^', include(router.urls)),
]
