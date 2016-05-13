from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()


router.register(r'media' , mediaViewSet , base_name ='media')
router.register(r'comment' , projectCommentViewSet , base_name ='projectComment')
router.register(r'project' , projectViewSet , base_name ='project')
router.register(r'timelineItem' , timelineItemViewSet , base_name ='timelineItem')
router.register(r'projectSearch' , projectLiteViewSet , base_name ='projectSearch')

urlpatterns = [
    url(r'^', include(router.urls)),
]
