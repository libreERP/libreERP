from rest_framework import viewsets , permissions , serializers
from django.shortcuts import render
from url_filter.integrations.drf import DjangoFilterBackend
from API.permissions import *
from PIM.models import *

def blogs(request):
    print 'home'
    recents = blogPost.objects.all().order_by('-created')[:5]
    print recents
    if request.user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = request.user.articles.all().count()
    return render(request , 'blogs.home.html', {'totalContribution' : totalContribution , 'recents' : recents})

def donateView(request):
    print 'donate'
    if request.user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = request.user.articles.all().count()
    return render(request , 'blogs.donate.html', {'totalContribution' : totalContribution})


def accountsView(request):
    print 'home'
    if request.user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = request.user.articles.all().count()
    return render(request , 'blogs.accounts.html', {'totalContribution' : totalContribution})

def searchView(request):
    print 'home'
    if request.user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = request.user.articles.all().count()
    return render(request , 'blogs.home.html', {'totalContribution' : totalContribution})

def browseView(request):
    print 'home'
    categories = blogCategory.objects.all()
    if request.user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = request.user.articles.all().count()
    return render(request , 'blogs.browse.html', {'totalContribution' : totalContribution , 'categories' : categories})

def pagesView(request , page):
    if request.user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = request.user.articles.all().count()
    return render(request , 'blogs.'+page+'.html', {'totalContribution' : totalContribution})

def categoryView(request , category):
    print 'cat' , category
    blogs = blogCategory.objects.get(title = category).articles.all()
    print blogs
    if request.user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = request.user.articles.all().count()
    print totalContribution
    return render(request , 'blogs.list.html', {'blogs' : blogs , 'totalContribution' : totalContribution})

def articleView(request , title):
    print 'article' , title
    if request.user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = request.user.articles.all().count()
    blog = blogPost.objects.get(title=title)
    return render(request , 'blogs.article.view.html', {'blog' : blog, 'totalContribution' : totalContribution })
