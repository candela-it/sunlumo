# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

import subprocess

from django.http import HttpResponse, Http404
from django.views.generic import TemplateView, View

from .renderer import Renderer
from .utils import writeParamsToJson


class MapView(TemplateView):
    template_name = 'mapview.html'


class GetMapView(View):
    def _parse_request_params(self, request):
        if not(all(param in request.GET for param in [
                'BBOX', 'WIDTH', 'HEIGHT'])):
            raise Http404

        try:
            bbox = [float(a) for a in request.GET.get('BBOX').split(',')]
            image_size = [
                int(a) for a in (
                    request.GET.get('WIDTH'), request.GET.get('HEIGHT'))
            ]
        except:
            # return 404 if any of parameters are missing or not parsable
            raise Http404

        return {
            'bbox': bbox,
            'image_size': image_size
        }

    def get(self, request, *args, **kwargs):

        params = self._parse_request_params(request)
        # QGIS_PROJECT = '/data/Landscape survey - Web.qgs'
        QGIS_PROJECT = '/data/simple.qgs'

        sl_project = Renderer(QGIS_PROJECT)
        img = sl_project.render(params)

        return HttpResponse(img, content_type='png')


class PrintPDFView(View):
    def _parse_request_params(self, request):
        if not(all(param in request.GET for param in [
                'BBOX', 'COMPOSER_TEMPLATE'])):
            raise Http404

        try:
            bbox = [float(a) for a in request.GET.get('BBOX').split(',')]
            composer_template = request.GET.get('COMPOSER_TEMPLATE')
        except:
            # return 404 if any of parameters are missing or not parsable
            raise Http404

        return {
            'bbox': bbox,
            'composer_template': composer_template
        }

    def get(self, request, *args, **kwargs):

        params = self._parse_request_params(request)
        params['project_file'] = '/data/simple.qgs'

        tmpFile = writeParamsToJson(params)

        # printing requires a subprocess call
        proc = subprocess.call(['python', 'manage.py', 'print_map', tmpFile])
        if proc:
            # subprocess did not exit cleanly
            raise Http404

        with open(tmpFile + '.pdf', 'r') as pdfFile:
            data = pdfFile.read()

        return HttpResponse(data, content_type='pdf')
