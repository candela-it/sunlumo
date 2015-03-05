# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sunlumo_similaritysearch', '0005_auto_20150304_0937'),
    ]

    operations = [
        migrations.AddField(
            model_name='indexattribute',
            name='ordering',
            field=models.IntegerField(default=-1),
            preserve_default=True,
        ),
    ]
