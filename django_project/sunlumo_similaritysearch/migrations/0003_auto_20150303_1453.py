# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sunlumo_similaritysearch', '0002_similarityindex_project'),
    ]

    operations = [
        migrations.AlterIndexTogether(
            name='similarityindex',
            index_together=set([('project', 'index_name', 'feature_id')]),
        ),
    ]
