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

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        # define output formats
        'verbose': {
            'format': (
                '%(levelname)s %(name)s %(asctime)s %(module)s %(process)d '
                '%(thread)d %(message)s')
        },
        'simple': {
            'format': (
                '%(name)s %(levelname)s %(filename)s L%(lineno)s: '
                '%(message)s')
        },
    },
    'handlers': {
        # console output
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
            'level': 'DEBUG',
        },
        # 'logfile': {
        #     'class': 'logging.FileHandler',
        #     'filename': '/tmp/app-dev.log',
        #     'formatter': 'simple',
        #     'level': 'DEBUG',
        # }
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'INFO',  # switch to DEBUG to show actual SQL
        },
        # example app logger
        'sunlumo_similaritysearch.utils': {
            'level': 'DEBUG',
            'handlers': ['console'],
            # propagate is True by default, which propagates logs upstream
            'propagate': False
        }
    },
    # root logger
    # non handled logs will propagate to the root logger
    'root': {
        'handlers': ['console'],
        'level': 'WARNING'
    }
}