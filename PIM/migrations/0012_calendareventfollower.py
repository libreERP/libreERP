# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2015-12-23 17:15
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('social', '0011_social_followers'),
        ('PIM', '0011_calendar_visibility'),
    ]

    operations = [
        migrations.CreateModel(
            name='calendarEventFollower',
            fields=[
                ('follow_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='social.follow')),
                ('parent', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='followers', to='PIM.calendar')),
            ],
            bases=('social.follow',),
        ),
    ]