# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

from django.http import HttpResponse
from django.views.generic import TemplateView, View

from .renderer import render


class MapView(TemplateView):
    template_name = 'mapview.html'


class GetMapView(View):
    def get(self, request, *args, **kwargs):

        bbox = [float(a) for a in request.GET.get('BBOX').split(',')]

        # QGIS_PROJECT = '/data/Landscape survey - Web.qgs'
        QGIS_PROJECT = '/data/simple.qgs'

        img = render(QGIS_PROJECT, {'bbox': bbox})
        response = HttpResponse(
            img, content_type='png'
        )

        return response
