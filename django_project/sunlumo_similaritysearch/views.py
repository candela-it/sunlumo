# -*- coding: utf-8 -*-
import logging

from django.views.generic import View
from django.http import Http404
from django.conf import settings

from braces.views import JSONRequestResponseMixin

from sunlumo_project.models import Project

from .searcher import Searcher

LOG = logging.getLogger(__name__)


class SimilaritySearchView(JSONRequestResponseMixin, View):

    def _parse_request_params(self, request_json):
        if not(all(param in request_json for param in ['search_string'])):
            raise Http404

        search_string = request_json.get('search_string')
        search_layers = request_json.get('search_layers')

        params = {
            'search_string': search_string,
            'search_layers': search_layers
        }

        return params

    def post(self, request, *args, **kwargs):

        params = self._parse_request_params(self.request_json)

        project = Project.objects.get(pk=settings.QGIS_PROJECT_ID)

        sl_project = Searcher(project.project_path)

        results = sl_project.search(params)

        return self.render_json_response(results)
