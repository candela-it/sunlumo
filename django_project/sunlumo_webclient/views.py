# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

import json

from django.views.generic import TemplateView
from django.conf import settings
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator

from sunlumo_mapserver.project import SunlumoProject


class IndexView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)

        project = SunlumoProject(settings.QGIS_PROJECT)

        context['SL_Details'] = json.dumps(project.getDetails())

        return context

    @method_decorator(ensure_csrf_cookie)
    def dispatch(self, *args, **kwargs):
        return super(IndexView, self).dispatch(*args, **kwargs)
