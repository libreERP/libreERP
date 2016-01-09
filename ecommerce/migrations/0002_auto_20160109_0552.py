# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-01-09 00:22
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('ecommerce', '0001_initial'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='spec',
            new_name='field',
        ),
        migrations.AddField(
            model_name='listing',
            name='files',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='listings', to='ecommerce.media'),
        ),
        migrations.AddField(
            model_name='listing',
            name='parentType',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='products', to='ecommerce.genericProduct'),
        ),
    ]