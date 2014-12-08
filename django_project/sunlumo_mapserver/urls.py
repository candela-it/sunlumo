# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url

from .views import MapView, GetMapView, PrintPDFView

urlpatterns = patterns(
    '',
    url(r'^$', MapView.as_view(), name='mapview'),
    url(r'^getmap$', GetMapView.as_view(), name='getmap'),
    url(r'^printpdf$', PrintPDFView.as_view(), name='printpdf')
)
