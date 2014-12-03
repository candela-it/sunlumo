# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

from django.http import HttpResponse, Http404
from django.views.generic import TemplateView, View

from .renderer import SunlumoProject


class MapView(TemplateView):
    template_name = 'mapview.html'


class GetMapView(View):
    def _parse_request_params(self, request):
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

        sl_project = SunlumoProject(QGIS_PROJECT)
        img = sl_project.render(params)

        return HttpResponse(img, content_type='png')
