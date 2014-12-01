# -*- coding: utf-8 -*-
from .contrib import *

# Project apps
INSTALLED_APPS += (
    'sunlumo_mapserver'
)


PIPELINE_JS = {
    'contrib': {
        'source_filenames': (
            # 'js/jquery-1.11.1.min.js',
            # 'js/csrf-ajax.js',
            # 'js/underscore-min.js'
        ),
        'output_filename': 'js/contrib.js',
    }
}

PIPELINE_CSS = {
    'contrib': {
        'source_filenames': (
            # 'css/bootstrap.min.css',
            # 'css/bootstrap-responsive.min.css',
        ),
        'output_filename': 'css/contrib.css',
        'extra_context': {
            'media': 'screen, projection',
        },
    }
}
