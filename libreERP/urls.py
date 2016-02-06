from django.conf.urls import include, url
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from homepage.views import index
from HR.views import loginView , logoutView , home , registerView , tokenAuthentication
from ecommerce.views import ecommerceHome , partnerRegistration

urlpatterns = [
    url(r"^$", ecommerceHome , name = 'index'),
    url(r'^api/', include('API.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^login', loginView , name ='login'),
    url(r'^register', registerView , name ='register'),
    url(r'^partners', partnerRegistration , name ='partnerRegistration'),
    url(r'^token', tokenAuthentication , name ='tokenAuthentication'),
    url(r'^logout/', logoutView , name ='logout'),
    url(r'^ERP/', home , name ='ERP'),
    url(r'^ecommerce/', ecommerceHome , name ='ecommerce'),
    url(r'^api-auth/', include('rest_framework.urls', namespace ='rest_framework')),
]

if settings.DEBUG:
    urlpatterns +=static(settings.STATIC_URL , document_root = settings.STATIC_ROOT)
    urlpatterns +=static(settings.MEDIA_URL , document_root = settings.MEDIA_ROOT)
