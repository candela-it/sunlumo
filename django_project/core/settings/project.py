# -*- coding: utf-8 -*-
from .contrib import *  # NOQA

# Project apps
INSTALLED_APPS += (
    'sunlumo_mapserver',
)


PIPELINE_JS = {
    'contrib': {
        'source_filenames': (
            'js/proj4-src.js',
            'js/ol.js',
        ),
        'output_filename': 'js/contrib.js',
    }
}

PIPELINE_CSS = {
    'contrib': {
        'source_filenames': (
            'css/ol.css',
        ),
        'output_filename': 'css/contrib.css',
        'extra_context': {
            'media': 'screen, projection',
        },
    }
}
