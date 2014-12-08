# -*- coding: utf-8 -*-
from .base import *  # NOQA

# Extra installed apps
INSTALLED_APPS += (
    'pipeline',
)

# define template function (example for underscore)
# PIPELINE_TEMPLATE_FUNC = '_.template'

# enable cached storage - requires uglify.js (node.js)
STATICFILES_STORAGE = 'pipeline.storage.PipelineCachedStorage'


STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'pipeline.finders.PipelineFinder'
)


# QGIS specific settings
QGIS_PYTHON_PATH = '/usr/share/qgis/python'

# add QGIS_PYTHON_PATH to system path
import sys
sys.path.append(QGIS_PYTHON_PATH)

QGIS_PREFIX_PATH = '/usr'

from qgis.core import QgsApplication
qgis_app = QgsApplication([], False)
QgsApplication.setPrefixPath(QGIS_PREFIX_PATH, True)
QgsApplication.initQgis()
