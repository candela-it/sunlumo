# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url

from .views import MapView

urlpatterns = patterns(
    '',
    url(r'^$', MapView.as_view(), name='mapview'),
)
