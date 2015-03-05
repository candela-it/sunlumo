# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sunlumo_project', '0001_squashed_0009_auto_20150303_1412'),
        ('sunlumo_similaritysearch', '0006_indexattribute_ordering'),
    ]

    operations = [
        migrations.AlterIndexTogether(
            name='indexdata',
            index_together=set([('index', 'feature_id')]),
        ),
        migrations.RemoveField(
            model_name='indexdata',
            name='project_id',
        ),
        migrations.AddField(
            model_name='indexspecification',
            name='project',
            field=models.ForeignKey(default=1, to='sunlumo_project.Project'),
            preserve_default=False,
        ),
    ]
