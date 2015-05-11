# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url

from .views import SimilaritySearchView, SearchSpecView, UpdateIndexView

urlpatterns = patterns(
    '',
    url(
        r'^api/search$', SimilaritySearchView.as_view(),
        name='similaritysearch'
    ),
    url(
        r'^api/searchspec$', SearchSpecView.as_view(),
        name='searchspec'
    ),
    url(
        r'^api/updateindex$', UpdateIndexView.as_view(),
        name='updateindex'
    )
)
