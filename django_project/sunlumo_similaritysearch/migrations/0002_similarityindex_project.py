# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sunlumo_project', '0001_squashed_0009_auto_20150303_1412'),
        ('sunlumo_similaritysearch', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='similarityindex',
            name='project',
            field=models.ForeignKey(default=1, to='sunlumo_project.Project'),
            preserve_default=False,
        ),
    ]
