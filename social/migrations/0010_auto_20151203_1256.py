# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('social', '0009_auto_20151202_1630'),
    ]

    operations = [
        migrations.AddField(
            model_name='album',
            name='tagged',
            field=models.ManyToManyField(related_name='taggedAlbums', to=settings.AUTH_USER_MODEL, blank=True),
        ),
        migrations.AddField(
            model_name='comment',
            name='tagged',
            field=models.ManyToManyField(related_name='taggedComments', to=settings.AUTH_USER_MODEL, blank=True),
        ),
    ]
