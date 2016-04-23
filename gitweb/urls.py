from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'repoPermission' , repoPermissionViewSet , base_name = 'repoPermission')
router.register(r'groupPermission' , groupPermissionViewSet , base_name = 'groupPermission')
router.register(r'gitGroup' , gitGroupViewSet , base_name = 'gitGroup')
router.register(r'repo' , repoViewSet , base_name = 'repo')
router.register(r'device' , deviceViewSet , base_name = 'device')
router.register(r'profile' , profileViewSet , base_name = 'profile')
router.register(r'commitNotification' , commitNotificationViewSet , base_name = 'commitNotification')
router.register(r'codeComment' , codeCommentViewSet , base_name = 'codeComment')

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'syncGitolite/$' , syncGitoliteApi.as_view()),
    url(r'registerDevice/$' , registerDeviceApi.as_view()),
    url(r'browseRepo/$' , browseRepoApi.as_view() ),
    url(r'gitoliteNotification/$' , gitoliteNotificationApi.as_view()),
]
