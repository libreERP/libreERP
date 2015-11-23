# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('social', '0006_auto_20151123_1344'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='tagged',
            field=models.ManyToManyField(to=settings.AUTH_USER_MODEL),
        ),
        migrations.RemoveField(
            model_name='picture',
            name='tagged',
        ),
        migrations.AddField(
            model_name='picture',
            name='tagged',
            field=models.ManyToManyField(to=settings.AUTH_USER_MODEL),
        ),
    ]
