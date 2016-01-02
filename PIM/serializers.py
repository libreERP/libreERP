from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from social.serializers import commentLikeSerializer
from social.models import commentLike

class themeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = theme
        fields = ( 'url' , 'main' , 'highlight' , 'background' , 'backgroundImg')

class settingsSerializer(serializers.HyperlinkedModelSerializer):
    theme = themeSerializer(many = False , read_only = True)
    class Meta:
        model = settings
        fields = ('url' , 'user', 'theme', 'presence')

class notificationSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = notification
        fields = ('url' , 'message' ,'shortInfo','domain','onHold', 'link' , 'originator' , 'created' ,'updated' , 'read' , 'user')

class calendarSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = calendar
        fields = ('url' , 'eventType' , 'followers' ,'originator', 'duration' , 'created', 'updated', 'user' , 'text' , 'notification' ,'when' , 'read' , 'deleted' , 'completed' , 'canceled' , 'level' , 'venue' , 'attachment' , 'myNotes')
        read_only_fields = ('followers',)
    def create(self , validated_data):
        cal = calendar.objects.create(**validated_data)
        if 'with' in  self.context['request'].data:
            tagged = self.context['request'].data['with']
            for tag in tagged.split(','):
                cal.followers.add( User.objects.get(username = tag))

        cal.user = self.context['request'].user
        cal.save()
        return cal
    def update(self, instance, validated_data): # like the comment
        for key in ['eventType', 'duration' , 'text' ,'when' , 'read' , 'deleted' , 'completed' , 'canceled' , 'level' , 'venue' , 'attachment' , 'myNotes']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        instance.followers.clear()
        if 'with' in  self.context['request'].data:
            tagged = self.context['request'].data['with']
            for tag in tagged.split(','):
                instance.followers.add( User.objects.get(username = tag))
        instance.save()
        return instance

class chatMessageSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = chatMessage
        fields = ('url' , 'message' ,'attachment', 'originator' , 'created' , 'read' , 'user')
        read_only_fields = ('originator' , )
    def create(self , validated_data):
        im = chatMessage.objects.create(**validated_data)
        im.originator = self.context['request'].user
        if im.originator == im.user:
            im.delete()
            raise ParseError(detail=None)
        else:
            im.save()
            return im


class blogLikeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = blogLike
        fields = ('url' , 'user' , 'created' , 'parent')
    def create(self , validated_data):
        parent = validated_data.pop('parent')
        user =  self.context['request'].user
        l, new = blogLike.objects.get_or_create(parent = parent , user = user)
        return l

class blogCommentLikeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = blogCommentLike
        fields = ('url' , 'user' , 'created' , 'parent')
    def create(self , validated_data):
        parent = validated_data.pop('parent')
        user =  self.context['request'].user
        l, new = blogLike.objects.get_or_create(parent = parent , user = user)
        return l

class blogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = blogCategory
        fields = ('pk', 'title' )

class blogCommentsSerializer(serializers.HyperlinkedModelSerializer):
    likes = blogCommentLikeSerializer(many = True , read_only = True)
    class Meta:
        model = blogComment
        fields = ('url' , 'user' , 'parent' , 'created' , 'text' , 'likes')
        read_only_fields = ('tagged', 'likes',)
    def create(self , validated_data):
        text = validated_data.pop('text')
        parent = validated_data.pop('parent')
        user =  self.context['request'].user
        comment = blogComment(text = text , parent = parent , user = user)
        comment.save()
        return comment
    def update(self, instance, validated_data): # like the comment
        user =  self.context['request'].user
        print commentLike.parent.__class__
        l , new = blogCommentLike.objects.get_or_create(user = user , parent = instance)
        return instance

class blogSerializer(serializers.HyperlinkedModelSerializer):
    likes = blogLikeSerializer(many = True , read_only = True)
    comments = blogCommentsSerializer(many = True , read_only = True)
    tags = blogCategorySerializer(many = True , read_only = True)
    class Meta:
        model = blogPost
        fields = ( 'url' , 'source' , 'likes' , 'comments' , 'created' , 'sourceFormat' , 'users' , 'tags' , 'title' , 'header' , 'state' , 'contentType')
        read_only_fields = ('tags',)
    def create(self , validated_data):
        b = blogPost()
        for key in ['source', 'sourceFormat', 'title' , 'header' , 'state']:
            try:
                setattr(b , key , validated_data[key])
            except:
                pass
        b.save()
        b.users.add (self.context['request'].user)
        if 'tags' in self.context['request'].data and self.context['request'].data['tags'] != '':
            tags = self.context['request'].data['tags']
            for tag in tags.split(','):
                b.tags.add( blogCategory.objects.get(title = tag.replace('-' , ' ')))

        b.save()
        return b


class notebookSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = notebook
        fields = ('url' , 'user', 'created' , 'pages' , 'title')
        read_only_fields = ('pages' , )
    def create(self , validated_data):
        n = notebook.objects.create(**validated_data)
        n.user = self.context['request'].user
        n.save()
        return n
    def update(self, instance, validated_data): # like the comment
        instance.title = validated_data['title']
        instance.save()
        return instance

class pageSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = page
        fields = ('url' , 'user', 'source' , 'parent' , 'title')
    def create(self , validated_data):
        p = page.objects.create(**validated_data)
        p.user = self.context['request'].user
        p.save()
        return p
    def update(self, instance, validated_data): # like the comment
        instance.title = validated_data['title']
        instance.source = validated_data['source']
        instance.save()
        return instance
