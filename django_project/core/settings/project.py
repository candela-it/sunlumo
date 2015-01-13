# -*- coding: utf-8 -*-
from .contrib import *  # NOQA

# Project apps
INSTALLED_APPS += (
    'sunlumo_mapserver',
    'sunlumo_webclient',
    'sunlumo_similaritysearch'
)


# QGIS project definition
QGIS_PROJECT = '/data/simple.qgs'

# GetFeatureInfo pixel buffer, how many pixels are used for a search
QGIS_GFI_BUFFER = 3
