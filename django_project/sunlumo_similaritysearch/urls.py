# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url

from .views import SimilaritySearchView

urlpatterns = patterns(
    '',
    url(
        r'^api/search$', SimilaritySearchView.as_view(),
        name='similaritysearch'
    )
)
