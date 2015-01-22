# -*- coding: utf-8 -*-
from .dev import *  # NOQA

DATABASES = {
    'default': {
        # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        # 'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        # Or path to database file if using sqlite3.
        'NAME': 'sunlumo_dev',
        # The following settings are not used with sqlite3:
        'USER': 'dodobas',
        'PASSWORD': '',
        # Empty for localhost through domain sockets or '127.0.0.1' for
        # localhost through TCP.
        'HOST': 'postgis',
        # Set to empty string for default.
        'PORT': '',
    }
}
