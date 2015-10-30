from django.conf.urls import include, url
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns = [
    url(r"^$", 'homepage.views.index' , name = 'index'),
    url(r'^api/', include('API.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^login', 'HR.views.Login' , name ='login'),
    url(r'^logout/', 'HR.views.Logout' , name ='logout'),
    url(r'^ERP/', 'HR.views.home' , name ='ERP'),
    url(r'^api-auth/', include('rest_framework.urls', namespace ='rest_framework')),
]

if settings.DEBUG:
    urlpatterns +=static(settings.STATIC_URL , document_root = settings.STATIC_ROOT)
    urlpatterns +=static(settings.MEDIA_URL , document_root = settings.MEDIA_ROOT)
