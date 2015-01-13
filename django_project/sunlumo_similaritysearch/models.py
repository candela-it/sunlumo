# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

from django.db import models


class SimilarityIndex(models.Model):
    qgis_project = models.TextField()
    qgis_layer_id = models.TextField()
    feature_id = models.TextField()
    text = models.TextField()

    class Meta:
        index_together = [['qgis_project', 'qgis_layer_id', 'feature_id']]
