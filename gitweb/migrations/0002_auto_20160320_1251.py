# -*- coding: utf-8 -*-
# Generated by Django 1.9.3 on 2016-03-20 07:21
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gitweb', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='grouppermission',
            name='users',
            field=models.ManyToManyField(to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='repo',
            name='groups',
            field=models.ManyToManyField(to='gitweb.groupPermission'),
        ),
    ]
