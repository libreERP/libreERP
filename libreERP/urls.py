from django.conf.urls import include, url
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns = [
    url(r"^$", 'homepage.views.index' , name = 'index'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^login', 'HR.views.Login' , name ='login'),
    url(r'^logout/', 'HR.views.Logout' , name ='logout'),

]
if settings.DEBUG:
    urlpatterns +=static(settings.STATIC_URL , document_root = settings.STATIC_ROOT)
    urlpatterns +=static(settings.MEDIA_URL , document_root = settings.MEDIA_ROOT)
