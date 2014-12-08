# -*- coding: utf-8 -*-
from .contrib import *

# Project apps
INSTALLED_APPS += (
    'sunlumo_mapserver',
)


PIPELINE_JS = {
    'contrib': {
        'source_filenames': (
            'js/leaflet.js',
            'js/proj4-src.js',
            'js/proj4leaflet.js',
            'js/NonTiledLayer.js',
            'js/NonTiledLayer.WMS.js'
        ),
        'output_filename': 'js/contrib.js',
    }
}

PIPELINE_CSS = {
    'contrib': {
        'source_filenames': (
            'css/leaflet.css',
        ),
        'output_filename': 'css/contrib.css',
        'extra_context': {
            'media': 'screen, projection',
        },
    }
}
