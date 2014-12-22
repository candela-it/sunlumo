# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

from django.views.generic import TemplateView


class IndexView(TemplateView):
    template_name = 'index.html'
