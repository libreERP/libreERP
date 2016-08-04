from rest_framework import viewsets , permissions , serializers
from django.shortcuts import render
from url_filter.integrations.drf import DjangoFilterBackend
from django.contrib import messages
from django.contrib.auth import authenticate
from API.permissions import *
from PIM.models import *
from HR.models import profile
from django.contrib.auth.decorators import login_required
from .models import *

def blogs(request):
    print 'home'
    recents = blogPost.objects.all().order_by('-created')[:5]
    print recents
    if request.user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = request.user.articles.all().count()
    return render(request , 'blogs.home.html', {'totalContribution' : totalContribution , 'recents' : recents})

@login_required(login_url = '/login')
def donateView(request):
    if request.user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = request.user.articles.all().count()
    return render(request , 'blogs.donate.html', {'totalContribution' : totalContribution})

def savedView(request):
    if request.user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = request.user.articles.all().count()
    bookmarks = request.user.blogsBookmarked.all()
    return render(request , 'blogs.saved.html', {'totalContribution' : totalContribution , 'bookmarks':bookmarks })

@login_required(login_url = '/login')
def accountsView(request):
    usrProfile = profile.objects.get(user = request.user)
    if request.method == 'POST':
        if request.GET['page'] == 'profile' :
            if 'dp' in request.FILES:
                dp = request.FILES['dp']
                usrProfile.displayPicture = dp
            if 'email' in request.POST:
                eml = request.POST['email']
                usrProfile.email = eml
            usrProfile.save()
            messages.success(request, "Profile updated successfully!")
        elif request.GET['page'] == 'password':
            p = request.POST['oldpassword']
            p1 = request.POST['password1']
            p2 = request.POST['password2']
            if p1 != p2:
                messages.error(request, "New password and confirm password does not match!")
            if len(p) == 0:
                messages.error(request, "Please provide the current password!")
            if len(p1) == 0:
                messages.error(request, "New password can not be left blank!")
            user = request.user
            if p1 == p2 and len(p1)!=0 and authenticate(username = user.username , password = p) is not None:
                user.set_password(p1)
                user.save()
                messages.success(request, "Password updated successfully!")
            else:
                if len(p) != 0:
                    messages.error(request, "Current password is not correct!")

    if 'page' in request.GET:
        tab = request.GET['page']
        if tab == 'profile':
            profileTab = True
            passwordTab = False
        else:
            profileTab = False
            passwordTab = True
    else:
        passwordTab = False
        profileTab = False
    if request.user.is_anonymous():
        totalContribution = 0
        contributedArticles = []
    else:
        contributedArticles = request.user.articles.all()
        totalContribution = contributedArticles.count()

    if request.user.is_anonymous() or profile.objects.get(user = request.user).displayPicture=='':
        DPSrc = '/static/images/userIcon.png'
    else:
        DPSrc = usrProfile.displayPicture.url

    ctx = {'totalContribution' : totalContribution ,
        'contributedArticles' : contributedArticles,
        'DPSrc' : DPSrc,
        'email' : usrProfile.email,
        'profileTab' : profileTab,
        'passwordTab' : passwordTab}
    return render(request , 'blogs.accounts.html', ctx)

def searchView(request):
    key = request.POST['key']
    if request.user.is_anonymous():
        totalContribution = 0
    else:
        totalContribution = request.user.articles.all().count()

    blogs = blogPost.objects.filter(title__contains=key)

    return render(request , 'blogs.search.html', {'totalContribution' : totalContribution , 'results' : blogs , 'key' : key})

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
    blog = blogPost.objects.filter(title=title)[0]
    if request.user.is_anonymous():
        totalContribution = 0
    else:
        if 'action' in request.GET:
            act = request.GET['action']
            if act == 'save':
                bb , new = blogBookmark.objects.get_or_create(user = request.user , blog = blog)
                bb.save()
            elif act == 'removeSave':
                bb = blogBookmark.objects.get(user = request.user , blog = blog)
                bb.delete()
            elif act == 'removeLike':
                bl = blogLike.objects.get(user = request.user , parent = blog)
                bl.delete()
            elif act == 'like':
                bl , new = blogLike.objects.get_or_create(user = request.user , parent = blog)
                bl.save()
            elif act == 'comment' and 'textarea' in request.POST:
                txt = request.POST['textarea']
                c = blogComment(user = request.user , parent = blog , text = txt)
                c.save()
        totalContribution = request.user.articles.all().count()
    if not request.user.is_anonymous() and blogBookmark.objects.filter(user = request.user , blog = blog).count() >0:
        saved = True
    else:
        saved = False
    likesCount = blogLike.objects.filter(parent = blog).count()
    if not request.user.is_anonymous() and blogLike.objects.filter(user = request.user , parent = blog).count() >0:
        liked = True
    else:
        liked = False
    comments = []
    for c in blogComment.objects.filter(parent = blog):
        dp = c.user.profile.displayPicture
        if dp == '':
            dp = '/static/images/userIcon.png'
        else:
            dp = dp.url
        comments.append({
            'name' : c.user.get_full_name(),
            'image' : dp,
            'text' : c.text
        })
    ctx = {'blog' : blog,
        'totalContribution' : totalContribution,
        'saved': saved,
        'liked' : liked,
        'likesCount':likesCount,
        'comments' : comments }
    return render(request , 'blogs.article.view.html', ctx )
