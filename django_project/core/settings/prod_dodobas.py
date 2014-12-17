# -*- coding: utf-8 -*-
from .prod import *  # NOQA

# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.7/ref/settings/#allowed-hosts
ALLOWED_HOSTS = ['*']

USE_X_FORWARDED_HOST = False

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
        'HOST': 'db',
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
        'logfile': {
            'class': 'logging.FileHandler',
            'filename': 'app-dev.log',
            'formatter': 'simple',
            'level': 'DEBUG',
        }
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['logfile'],
            'level': 'INFO',  # switch to DEBUG to show actual SQL
        },
        'django': {
            'handlers': ['logfile'],
            'level': 'DEBUG',
            'propagate': True
        }
        # example app logger
        # 'app.module': {
        #     'level': 'INFO',
        #     'handlers': ['logfile'],
        #     # propagate is True by default, which proppagates logs upstream
        #     'propagate': False
        # }
    },
    # root logger
    # non handled logs will propagate to the root logger
    'root': {
        'handlers': ['logfile'],
        'level': 'DEBUG'
    }
}
