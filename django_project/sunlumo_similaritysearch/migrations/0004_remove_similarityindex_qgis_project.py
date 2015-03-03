# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sunlumo_similaritysearch', '0003_auto_20150303_1453'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='similarityindex',
            name='qgis_project',
        ),
    ]
