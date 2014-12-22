# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url

from .views import GetMapView, PrintPDFView, ProjectDetails

urlpatterns = patterns(
    '',
    url(r'^getmap$', GetMapView.as_view(), name='getmap'),
    url(r'^printpdf$', PrintPDFView.as_view(), name='printpdf'),
    url(r'^projectdetails$', ProjectDetails.as_view(), name='projectdetails')
)
