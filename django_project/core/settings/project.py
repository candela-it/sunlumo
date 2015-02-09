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
    'kucni broj': {
        'layer_id': 'KUCNI_BROJEVI20150122212721727',
        'fields': ['ULICA', 'KUCNI_BROJ'],
        'pk': 'fid'
    },
    'ko lovrec': {
        'layer_id': 'KO_LOVREC_CESTICE20150122212721706',
        'fields': ['BROJ_KC'],
        'pk': 'fid'
    },
    'ko medovdolac': {
        'layer_id': 'KO_MEDOVDOLAC_CESTICE20150122212721718',
        'fields': ['BROJ_KC'],
        'pk': 'fid'
    },
    'ko opanci': {
        'layer_id': 'KO_OPANCI_CESTICE20150122212721709',
        'fields': ['BROJ_KC'],
        'pk': 'fid'
    },
    'ko studenci': {
        'layer_id': 'KO_STUDENCI_CESTICE20150122212721733',
        'fields': ['BROJ_KC'],
        'pk': 'fid'
    }
}
