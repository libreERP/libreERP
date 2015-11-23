# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('social', '0004_auto_20151123_1316'),
    ]

    operations = [
        migrations.AlterField(
            model_name='follow',
            name='enrollment',
            field=models.CharField(default=b'tagged', max_length=10, choices=[(b'tagged', b'tagged'), (b'starred', b'starred'), (b'action', b'action')]),
        ),
        migrations.AlterField(
            model_name='follow',
            name='user',
            field=models.ForeignKey(related_name='following', to=settings.AUTH_USER_MODEL),
        ),
    ]
