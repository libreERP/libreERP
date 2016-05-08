from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()

router.register(r'media' , mediaViewSet , base_name ='media')
router.register(r'task' , taskViewSet , base_name ='projectComment')
router.register(r'subTask' , subTaskViewSet , base_name ='project')

urlpatterns = [
    url(r'^', include(router.urls)),
]
