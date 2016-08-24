from django.conf.urls import include, url
from .views import *
from rest_framework import routers

router = routers.DefaultRouter()

router.register(r'process' , processViewSet , base_name ='process')
router.register(r'processFileVersion' , processFileVersionViewSet , base_name ='processFileVersion')
router.register(r'processRunLog' , processRunLogViewSet , base_name ='processRunLog')
router.register(r'logParameter' , logParameterViewSet , base_name ='logParameter')

urlpatterns = [
    url(r'^', include(router.urls)),
]
