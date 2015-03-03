# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import logging

from django.db import models
from django.utils.encoding import python_2_unicode_compatible

from model_utils.models import TimeStampedModel

LOG = logging.getLogger(__name__)


@python_2_unicode_compatible
class Project(TimeStampedModel):
    title = models.CharField(max_length=60)
    logo = models.ImageField(upload_to='project_logos')
    project_file = models.FileField(upload_to='projects')

    def __str__(self):
        return '{}'.format(self.title)


@python_2_unicode_compatible
class Layer(models.Model):
    project = models.ForeignKey('Project')
    title = models.CharField(max_length=60)

    def __str__(self):
        return '{}'.format(self.title)


@python_2_unicode_compatible
class Attribute(models.Model):
    layer = models.ForeignKey('Layer')
    name = models.CharField(max_length=60)
    visible = models.BooleanField(default=True)

    def __str__(self):
        return '{}'.format(self.name)
