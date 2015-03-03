# -*- coding: utf-8 -*-
import logging

from django.db import models

LOG = logging.getLogger(__name__)


class SimilarityIndex(models.Model):
    project = models.ForeignKey('sunlumo_project.Project')
    index_name = models.TextField()
    feature_id = models.TextField()
    text = models.TextField()

    class Meta:
        index_together = [['project', 'index_name', 'feature_id']]
