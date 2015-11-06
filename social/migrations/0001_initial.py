# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import social.models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='album',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now=True)),
                ('title', models.CharField(max_length=50, null=True)),
                ('user', models.ForeignKey(related_name='socialAlbums', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='comment',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now=True)),
                ('attachment', models.FileField(null=True, upload_to=social.models.getCommentAttachmentPath)),
                ('text', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='follow',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(related_name='itemsFollowing', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='like',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='picture',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('photo', models.ImageField(upload_to=social.models.getSocialPictureUploadPath)),
                ('created', models.DateTimeField(auto_now=True)),
                ('tagged', models.CharField(max_length=1000, null=True)),
                ('album', models.ForeignKey(related_name='photos', to='social.album', null=True)),
                ('user', models.ForeignKey(related_name='socialPhotos', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='post',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.TextField(max_length=300)),
                ('attachment', models.FileField(null=True, upload_to=social.models.getPostAttachmentPath)),
                ('created', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(related_name='socialPost', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='postHistory',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now=True)),
                ('text', models.TextField(max_length=300)),
                ('attachment', models.FileField(null=True, upload_to=social.models.getPostAttachmentPath)),
                ('parent', models.ForeignKey(related_name='history', to='social.post')),
            ],
        ),
        migrations.CreateModel(
            name='commentLike',
            fields=[
                ('like_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='social.like')),
            ],
            bases=('social.like',),
        ),
        migrations.CreateModel(
            name='pictureComment',
            fields=[
                ('comment_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='social.comment')),
                ('parent', models.ForeignKey(related_name='comments', to='social.picture')),
            ],
            bases=('social.comment',),
        ),
        migrations.CreateModel(
            name='pictureLike',
            fields=[
                ('like_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='social.like')),
                ('parent', models.ForeignKey(related_name='likes', to='social.picture')),
            ],
            bases=('social.like',),
        ),
        migrations.CreateModel(
            name='postComment',
            fields=[
                ('comment_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='social.comment')),
                ('parent', models.ForeignKey(related_name='comments', to='social.post')),
            ],
            bases=('social.comment',),
        ),
        migrations.CreateModel(
            name='postLike',
            fields=[
                ('like_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='social.like')),
                ('parent', models.ForeignKey(related_name='likes', to='social.post')),
            ],
            bases=('social.like',),
        ),
        migrations.AddField(
            model_name='like',
            name='user',
            field=models.ForeignKey(related_name='commentsLiked', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='comment',
            name='user',
            field=models.ForeignKey(related_name='postsCommented', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='commentlike',
            name='parent',
            field=models.ForeignKey(related_name='likes', to='social.comment'),
        ),
    ]
