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


class UpperParamsMixin(object):
    def dispatch(self, request, *args, **kwargs):
        self.req_params = {
            key.upper(): request.GET[key] for key in request.GET.keys()
        }
        return super(UpperParamsMixin, self).dispatch(
            request, *args, **kwargs
        )


class GetMapView(UpperParamsMixin, View):
    def _parse_request_params(self, request):
        if not(all(param in self.req_params for param in [
                'BBOX', 'WIDTH', 'HEIGHT', 'MAP', 'SRS'])):
            raise Http404

        try:
            bbox = [float(a) for a in self.req_params.get('BBOX').split(',')]
            image_size = [
                int(a) for a in (
                    self.req_params.get('WIDTH'),
                    self.req_params.get('HEIGHT'))
            ]
            srs = int(self.req_params.get('SRS').split(':')[-1])
            map_file = self.req_params.get('MAP')
        except:
            # return 404 if any of parameters are missing or not parsable
            raise Http404

        # map must have a value
        if not(map_file):
            raise Http404

        return {
            'bbox': bbox,
            'image_size': image_size,
            'map_file': map_file,
            'srs': srs
        }

    def get(self, request, *args, **kwargs):
        params = self._parse_request_params(request)

        sl_project = Renderer(params.get('map_file'))
        img = sl_project.render(params)

        return HttpResponse(img, content_type='png')


class PrintPDFView(UpperParamsMixin, View):
    def _parse_request_params(self, request):
        if not(all(param in self.req_params for param in [
                'BBOX', 'LAYOUT'])):
            raise Http404

        try:
            bbox = [float(a) for a in self.req_params.get('BBOX').split(',')]
            layout = self.req_params.get('LAYOUT')
            map_file = self.req_params.get('MAP')
        except:
            # return 404 if any of parameters are missing or not parsable
            raise Http404

        if not(layout) or not(map_file):
            # composer template should not be empty
            raise Http404

        return {
            'bbox': bbox,
            'layout': layout,
            'map_file': map_file
        }

    def get(self, request, *args, **kwargs):

        params = self._parse_request_params(request)

        tmpFile = writeParamsToJson(params)

        # printing requires a subprocess call
        proc = subprocess.call(['python', 'manage.py', 'print_map', tmpFile])
        if proc:
            # subprocess did not exit cleanly
            raise Http404

        with open(tmpFile + '.pdf', 'r') as pdfFile:
            data = pdfFile.read()

        return HttpResponse(data, content_type='pdf')
