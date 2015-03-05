# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import logging


from django.utils.encoding import python_2_unicode_compatible
from django.db import models

LOG = logging.getLogger(__name__)


@python_2_unicode_compatible
class IndexSpecification(models.Model):
    project = models.ForeignKey('sunlumo_project.Project')
    name = models.CharField(max_length=20)
    layer = models.ForeignKey('sunlumo_project.Layer')
    fields = models.ManyToManyField(
        'sunlumo_project.Attribute', through='IndexAttribute',
        through_fields=('index', 'attribute')
    )

    def __str__(self):
        return '{}'.format(self.name)


@python_2_unicode_compatible
class IndexAttribute(models.Model):
    attribute = models.ForeignKey('sunlumo_project.Attribute')
    index = models.ForeignKey('IndexSpecification')
    primary_key = models.BooleanField(default=False)
    ordering = models.IntegerField(default=-1)

    def __str__(self):
        return '{} ({})'.format(self.index, self.attribute)


class IndexData(models.Model):
    index = models.ForeignKey('IndexSpecification')
    feature_id = models.TextField()
    text = models.TextField()

    class Meta:
        index_together = [['index', 'feature_id']]
