from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()


router.register(r'notebook' , notebookViewSet , base_name ='notebook')
router.register(r'page' , pageViewSet , base_name ='page')
router.register(r'blog' , blogViewSet , base_name ='blogpost')
router.register(r'blogComment' , blogCommentsViewSet , base_name ='blogcomment')
router.register(r'blogCommentLike' , blogCommentLikesViewSet , base_name ='blogcommentlike')
router.register(r'blogTags' , blogCategoryViewSet , base_name ='blogcategory')
router.register(r'blogLike' , blogLikesViewSet , base_name ='bloglike')
router.register(r'settings' , settingsViewSet , base_name = 'settings')
router.register(r'theme' , themeViewSet , base_name = 'theme')
router.register(r'notification' , notificationViewSet, base_name = 'notification')
router.register(r'chatMessage' , chatMessageViewSet, base_name = 'chatmessage')
router.register(r'calendar' , calendarViewSet , base_name = 'calendar')
router.register(r'chatMessageBetween' , chatMessageBetweenViewSet, base_name = 'chatbetween')

urlpatterns = [
    url(r'^', include(router.urls)),
]
