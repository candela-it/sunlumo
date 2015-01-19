# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

from django.views.generic import View

from braces.views import JSONRequestResponseMixin

from .searcher import Searcher


class SimilaritySearchView(JSONRequestResponseMixin, View):

    def post(self, request, *args, **kwargs):

        sl_project = Searcher('/data/simple.qgs')

        results = sl_project.search(self.request_json)

        return self.render_json_response(results)
