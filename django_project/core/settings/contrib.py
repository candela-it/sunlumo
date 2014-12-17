# -*- coding: utf-8 -*-
from .base import *  # NOQA

# Extra installed apps
INSTALLED_APPS += (
    # any 3rd party apps
)

# enable cached storage
STATICFILES_STORAGE = (
    'django.contrib.staticfiles.storage.CachedStaticFilesStorage'
)


STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder'
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
