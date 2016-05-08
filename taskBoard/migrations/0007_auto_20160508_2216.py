# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-05-08 16:46
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('taskBoard', '0006_auto_20160508_2134'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='followers',
            field=models.ManyToManyField(blank=True, related_name='taskFollowing', to=settings.AUTH_USER_MODEL),
        ),
    ]
