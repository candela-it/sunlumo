# -*- coding: utf-8 -*-
import logging
LOG = logging.getLogger(__name__)

from django.views.generic import View

from braces.views import JSONResponseMixin

from .searcher import Searcher


class SimilaritySearchView(JSONResponseMixin, View):

    def get(self, request, *args, **kwargs):

        sl_project = Searcher('/data/simple.qgs')
        results = sl_project.search({})

        return self.render_json_response(results)
