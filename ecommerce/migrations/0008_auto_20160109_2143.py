# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-01-09 16:13
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ecommerce', '0007_auto_20160109_2142'),
    ]

    operations = [
        migrations.AlterField(
            model_name='listing',
            name='files',
            field=models.ManyToManyField(related_name='listings', to='ecommerce.media'),
        ),
    ]