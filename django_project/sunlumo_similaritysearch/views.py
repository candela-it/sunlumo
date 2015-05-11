# -*- coding: utf-8 -*-
import logging

from django.views.generic import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import Http404
from django.conf import settings

from braces.views import JSONResponseMixin, JSONRequestResponseMixin
from sunlumo_project.models import Project

from .searcher import Searcher

LOG = logging.getLogger(__name__)


class SimilaritySearchView(JSONRequestResponseMixin, View):

    def _parse_request_params(self, request_json):
        required_params = ['search_string', 'search_layers']

        if not(all(param in request_json for param in required_params)):
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

        project = Project.objects.get(pk=settings.SUNLUMO_PROJECT_ID)

        sl_project = Searcher(project.project_path)

        results = sl_project.search(params)

        return self.render_json_response(results)


class SearchSpecView(JSONResponseMixin, View):

    def get(self, request, *args, **kwargs):

        project = Project.objects.get(pk=settings.SUNLUMO_PROJECT_ID)

        sl_project = Searcher(project.project_path)

        results = sl_project.searchspec()

        return self.render_json_response(results)


class UpdateIndexView(JSONRequestResponseMixin, View):

    def _parse_request_params(self, request_json):
        required_params = ['reindex']

        if not(all(param in request_json for param in required_params)):
            raise Http404

        reindex = request_json.get('reindex')

        params = {
            'reindex': reindex
        }

        return params

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super(UpdateIndexView, self).dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):

        params = self._parse_request_params(self.request_json)

        project = Project.objects.get(pk=settings.SUNLUMO_PROJECT_ID)

        sl_project = Searcher(project.project_path)

        results = sl_project.reindex_features(params)

        return self.render_json_response(results)
