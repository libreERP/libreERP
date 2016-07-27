from django.conf.urls import include, url
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from views import *

urlpatterns = [
    url(r'^$', blogs , name="blogsHome"),
    url(r'^(?P<category>\w+)/$', categoryView),
    url(r'^(?P<category>\w+)/(?P<title>\w+)/$', articleView),
]
