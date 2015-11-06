from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'post' , postViewSet , base_name ='post')
router.register(r'social' , socialViewSet , base_name ='social')
router.register(r'picture' , pictureViewSet , base_name ='picture')
router.register(r'album' , albumViewSet , base_name ='album')
router.register(r'postComment' , postCommentsViewSet , base_name ='postcomment')
router.register(r'postLike' , postLikesViewSet , base_name ='postlike')
router.register(r'commentLike' , commentLikesViewSet , base_name ='commentlike')
router.register(r'pictureComment' , pictureCommentsViewSet , base_name ='picturecomment')
router.register(r'pictureLike' , pictureLikesViewSet , base_name ='picturelike')

urlpatterns = [
    url(r'^', include(router.urls)),
]
