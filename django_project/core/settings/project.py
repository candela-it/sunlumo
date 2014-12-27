# -*- coding: utf-8 -*-
from .contrib import *  # NOQA

# Project apps
INSTALLED_APPS += (
    'sunlumo_mapserver',
    'sunlumo_webclient'
)


QGIS_PROJECT = '/data/simple.qgs'
