from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()

# router.register(r'settings' , settingsViewSet , base_name = 'settings')

urlpatterns = [
    url(r'^', include(router.urls)),
]
