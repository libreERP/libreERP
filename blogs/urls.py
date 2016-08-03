from django.conf.urls import include, url
from django.contrib import admin
from django.conf import settings
from views import *

urlpatterns = [
    url(r'^$', blogs , name="blogs"),
    url(r'^pages/(?P<page>\w+)/$', pagesView , name='pageView'),
    url(r'^browse$', browseView , name='browseView'),
    url(r'^category/(?P<category>[-%&+0-9a-zA-Z ]+)/$', categoryView , name='blogsCategoryView'),
    url(r'^article/(?P<title>[-%&+0-9a-zA-Z ]+)/$', articleView , name = 'blogsArticleView'),
    url(r'^accounts/$', accountsView , name = 'blogsAccountsView'),
    url(r'^search/$', searchView , name = 'blogsSearchView'),
    url(r'^donate/$', donateView , name = 'blogsDonateView'),
    url(r'^saved/$', savedView , name = 'blogsSavedView'),
]
