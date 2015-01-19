# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

from django.views.generic import View
from django.http import Http404

from braces.views import JSONRequestResponseMixin

from .searcher import Searcher


class SimilaritySearchView(JSONRequestResponseMixin, View):

    def _parse_request_params(self, request_json):
        if not(all(param in request_json for param in [
                'map_file', 'search_string'])):
            raise Http404

        map_file = request_json.get('map_file')
        search_string = request_json.get('search_string')

        if not(map_file):
            raise Http404

        params = {
            'map_file': map_file,
            'search_string': search_string
        }

        return params

    def post(self, request, *args, **kwargs):

        params = self._parse_request_params(self.request_json)

        sl_project = Searcher(params.get('map_file'))

        results = sl_project.search(self.request_json)

        return self.render_json_response(results)
