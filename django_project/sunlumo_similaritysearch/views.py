# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

from django.http import HttpResponse, Http404
from django.views.generic import View

from braces.views import JSONResponseMixin
