# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url

from .views import MapView, GetMapView

urlpatterns = patterns(
    '',
    url(r'^$', MapView.as_view(), name='mapview'),
    url(r'^getmap$', GetMapView.as_view(), name='getmapview'),
)
