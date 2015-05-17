# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import logging
import shutil

from django.db import models
from django.utils.encoding import python_2_unicode_compatible

from model_utils.models import TimeStampedModel

from sunlumo_mapserver.project import SunlumoProject

LOG = logging.getLogger(__name__)


@python_2_unicode_compatible
class Project(TimeStampedModel):
    title = models.CharField(max_length=60)
    logo = models.ImageField(upload_to='project_logos', null=True, blank=True)
    project_file = models.FileField(upload_to='projects')
    project_path = models.CharField(
        max_length=255,
        help_text='Full path on the server to the project file'
    )

    def __str__(self):
        return '{}'.format(self.title)

    def save(self, *args, **kwargs):
        super(Project, self).save(*args, **kwargs)

        self.overwrite_project_file()
        self.parse_project_file()

    def overwrite_project_file(self):
        LOG.debug(
            'Overwriting project file %s at %s!',
            self.project_file.path, self.project_path
        )
        shutil.copy(self.project_file.path, self.project_path)

    def parse_project_file(self):
        sl_project = SunlumoProject(self.project_path)
        for layer_id, values in sl_project.LAYERS_DATA.items():
            layer, created = Layer.objects.update_or_create(
                layer_id=layer_id, defaults={
                    'project_id': self.pk, 'title': values['layer_name'],
                    'visible': values['visible'],
                    'layer_type': values['type']
                }
            )
            for attribute in sl_project.getAttributesForALayer(layer_id):
                Attribute.objects.get_or_create(
                    layer_id=layer_id, name=attribute
                )


@python_2_unicode_compatible
class Layer(models.Model):
    layer_id = models.CharField(
        max_length=60, primary_key=True, editable=False
    )
    project = models.ForeignKey('Project')
    title = models.CharField(max_length=60)
    visible = models.BooleanField(default=True)
    layer_type = models.CharField(max_length=20)

    def __str__(self):
        return '{}'.format(self.title)


@python_2_unicode_compatible
class Attribute(models.Model):
    layer = models.ForeignKey('Layer')
    name = models.CharField(max_length=60)
    visible = models.BooleanField(default=True)
    identifier = models.BooleanField(default=False)

    def __str__(self):
        return '{} ({})'.format(self.name, self.layer.title)
