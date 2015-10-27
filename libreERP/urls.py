from django.conf.urls import include, url
from django.contrib import admin
from homepage.views import *

urlpatterns = [
    url(r"^$", index , name = 'index'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^login', 'HR.views.Login' , name ='login'),
    url(r'^logout/', 'HR.views.Logout' , name ='logout'),

]
