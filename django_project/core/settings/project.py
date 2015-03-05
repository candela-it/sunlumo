# -*- coding: utf-8 -*-
from .contrib import *  # NOQA

# Project apps
INSTALLED_APPS += (
    'sunlumo_project',
    'sunlumo_mapserver',
    'sunlumo_webclient',
    'sunlumo_similaritysearch'
)


# SUNLUMO project definition
SUNLUMO_PROJECT_ID = 1

# GetFeatureInfo pixel buffer, how many pixels are used for a search
SUNLUMO_GFI_BUFFER = 3
