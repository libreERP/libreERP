# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2015-12-18 08:03
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('PIM', '0010_auto_20151217_1947'),
    ]

    operations = [
        migrations.AddField(
            model_name='calendar',
            name='visibility',
            field=models.CharField(choices=[(b'personal', b'personal'), (b'public', b'public'), (b'management', b'management'), (b'friends', b'friends')], default=b'personal', max_length=20),
        ),
    ]