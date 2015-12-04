# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('social', '0010_auto_20151203_1256'),
    ]

    operations = [
        migrations.AddField(
            model_name='social',
            name='followers',
            field=models.ManyToManyField(related_name='peopleFollowing', to=settings.AUTH_USER_MODEL, blank=True),
        ),
    ]
