# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('social', '0007_auto_20151123_1513'),
    ]

    operations = [
        migrations.AlterField(
            model_name='picture',
            name='tagged',
            field=models.ManyToManyField(related_name='taggedPictures', to=settings.AUTH_USER_MODEL, blank=True),
        ),
    ]
