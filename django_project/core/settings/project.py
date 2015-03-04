# -*- coding: utf-8 -*-
from .contrib import *  # NOQA

# Project apps
INSTALLED_APPS += (
    'sunlumo_project',
    'sunlumo_mapserver',
    'sunlumo_webclient',
    'sunlumo_similaritysearch'
)


# QGIS project definition
QGIS_PROJECT_ID = 1

# GetFeatureInfo pixel buffer, how many pixels are used for a search
QGIS_GFI_BUFFER = 3
