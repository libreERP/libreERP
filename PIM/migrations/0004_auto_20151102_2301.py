# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('PIM', '0003_auto_20151102_2259'),
    ]

    operations = [
        migrations.AlterField(
            model_name='theme',
            name='parent',
            field=models.OneToOneField(related_name='theme', to='PIM.settings'),
        ),
    ]
