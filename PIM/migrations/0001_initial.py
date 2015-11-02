# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings
import PIM.models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='settings',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('presence', models.CharField(default=b'NA', max_length=15, choices=[(b'NA', b'NA'), (b'Available', b'Available'), (b'Busy', b'Busy'), (b'Away', b'Away'), (b'On Leave', b'On Leave'), (b'In A Meeting', b'In a meeting')])),
                ('user', models.OneToOneField(to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='theme',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('main', models.CharField(max_length=10, null=True)),
                ('highlight', models.CharField(max_length=10, null=True)),
                ('background', models.CharField(max_length=10, null=True)),
                ('backgroundImg', models.ImageField(null=True, upload_to=PIM.models.getThemeImageUploadPath)),
                ('parent', models.ForeignKey(related_name='theme', to='PIM.settings')),
            ],
        ),
    ]
