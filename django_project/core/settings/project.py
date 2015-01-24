# -*- coding: utf-8 -*-
from .contrib import *  # NOQA

# Project apps
INSTALLED_APPS += (
    'sunlumo_mapserver',
    'sunlumo_webclient',
    'sunlumo_similaritysearch'
)


# QGIS project definition
QGIS_PROJECT = '/data/lovrec.qgs'

# GetFeatureInfo pixel buffer, how many pixels are used for a search
QGIS_GFI_BUFFER = 3

QGIS_SIMILARITY_SEARCH = {
    'cres code': {
        'layer_id': 'Cres__Corine_LC20141202224530380',
        'fields': ['code_06', 'id'],
        'pk': 'id'
    },
    'osm amenity': {
        'layer_id': 'points20150113152732133',
        'fields': ['amenity', 'name'],
        'pk': 'osm_id'
    }
}
