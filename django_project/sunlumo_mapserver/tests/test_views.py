# -*- coding: utf-8 -*-

from django.test import TestCase, Client
from django.core.urlresolvers import reverse


class TestViews(TestCase):
    def setUp(self):
        self.client = Client()

    def test_getmap_view_mising_params(self):
        resp = self.client.get(reverse('getmap'))

        self.assertEqual(resp.status_code, 404)

    def test_getmap_view_bad_params(self):
        # bad bbox
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-a,-b,c,d', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png', 'layers': 'polygons,lines,points',
            'transparencies': '50,0,0'
        })

        self.assertEqual(resp.status_code, 404)

        # bad heigth
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 'a', 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png', 'layers': 'polygons,lines,points',
            'transparencies': '50,0,0'
        })

        self.assertEqual(resp.status_code, 404)

        # bad width
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 'b', 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png', 'layers': 'polygons,lines,points',
            'transparencies': '50,0,0'
        })

        self.assertEqual(resp.status_code, 404)

        # bad srs
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 'a',
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png', 'layers': 'polygons,lines,points',
            'transparencies': '50,0,0'
        })

        self.assertEqual(resp.status_code, 404)

        # missing map parameter
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': '', 'format': 'image/png',
            'layers': 'polygons,lines,points', 'transparencies': '50,0,0'
        })

        self.assertEqual(resp.status_code, 404)

        # unknown image format
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/unknown', 'layers': 'polygons,lines,points',
            'transparencies': '50,0,0'
        })

        self.assertEqual(resp.status_code, 404)

        # unparsable image format
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'some_weird_format', 'layers': 'polygons,lines,points',
            'transparencies': '50,0,0'
        })

        self.assertEqual(resp.status_code, 404)

        # missing layers param
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png', 'transparencies': '50,0,0'
        })

        self.assertEqual(resp.status_code, 404)

        # missing transparencies param
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png', 'layers': 'polygons,lines,points'
        })

        self.assertEqual(resp.status_code, 404)

        # missing bad transparencies param
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png', 'layers': 'polygons,lines,points',
            'transparencies': 'a,b,c'
        })

        self.assertEqual(resp.status_code, 404)

    def test_getmap_view(self):
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png', 'layers': 'polygons,lines,points,raster',
            'transparencies': '50,0,0,25'
        })

        self.assertEqual(resp.status_code, 200)

        # this might fail, CAUTION
        self.assertEqual(
            len(resp.content), 6156,
            'Fails sometimes, due to UNKNOWN issues with QGS Python API !!!'
        )

        self.assertEqual(resp['Content-Type'], 'png')

    def test_getmap_view_layers(self):
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png', 'layers': 'points,polygons',
            'transparencies': '0,50'
        })

        self.assertEqual(resp.status_code, 200)

        self.assertEqual(len(resp.content), 4742)

        self.assertEqual(resp['Content-Type'], 'png')

    def test_getmap_view_empty_layers(self):
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png', 'layers': '', 'transparencies': ''
        })

        self.assertEqual(resp.status_code, 200)

        self.assertEqual(len(resp.content), 350)

        self.assertEqual(resp['Content-Type'], 'png')

    def test_getmap_view_bgcolor(self):
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png', 'bgcolor': 'FFFFFF', 'transparent': 'TRUE',
            'layers': 'polygons,lines,points', 'transparencies': '50,0,0'
        })

        self.assertEqual(resp.status_code, 200)

        self.assertEqual(len(resp.content), 5451)

        self.assertEqual(resp['Content-Type'], 'png')

    def test_printpdf_view_mising_params(self):
        resp = self.client.get(reverse('printpdf'))

        self.assertEqual(resp.status_code, 404)

    def test_printpdf_view_bad_params(self):
        # bad bbox param
        resp = self.client.get(reverse('printpdf'), {
            'bbox': '-a,-b,c,d', 'layout': 'test_layout',
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'layers': 'polygons,lines,points', 'transparencies': '50,0,0'
        })

        self.assertEqual(resp.status_code, 404)

        # missing layout
        resp = self.client.get(reverse('printpdf'), {
            'bbox': '-2,-2,2,2', 'layout': '',
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'layers': 'polygons,lines,points', 'transparencies': '50,0,0'
        })

        self.assertEqual(resp.status_code, 404)

        # missing map param
        resp = self.client.get(reverse('printpdf'), {
            'bbox': '-2,-2,2,2', 'layout': 'test_layout',
            'map': '', 'layers': 'polygons,lines,points',
            'transparencies': '50,0,0'
        })

        self.assertEqual(resp.status_code, 404)

        # missing layers param
        resp = self.client.get(reverse('printpdf'), {
            'bbox': '-2,-2,2,2', 'layout': 'test_layout',
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'transparencies': '50,0,0'
        })

        self.assertEqual(resp.status_code, 404)

        # missing transparencies param
        resp = self.client.get(reverse('printpdf'), {
            'bbox': '-2,-2,2,2', 'layout': 'test_layout',
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'layers': 'polygons,lines,points',
        })

        self.assertEqual(resp.status_code, 404)

    def test_printpdf_view(self):
        resp = self.client.get(reverse('printpdf'), {
            'bbox': '-2,-2,2,2', 'layout': 'test_layout',
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'layers': 'polygons,lines,points,raster',
            'transparencies': '50,0,0,25'
        })

        self.assertEqual(resp.status_code, 200)

        self.assertEqual(len(resp.content), 445925)

        self.assertEqual(resp['Content-Type'], 'pdf')

    def test_printpdf_view_layers(self):
        resp = self.client.get(reverse('printpdf'), {
            'bbox': '-2,-2,2,2', 'layout': 'test_layout',
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'layers': 'polygons,lines', 'transparencies': '50,0'
        })

        self.assertEqual(resp.status_code, 200)

        self.assertEqual(len(resp.content), 412947)

        self.assertEqual(resp['Content-Type'], 'pdf')

    def test_printpdf_view_empty_layers(self):
        resp = self.client.get(reverse('printpdf'), {
            'bbox': '-2,-2,2,2', 'layout': 'test_layout',
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'layers': '', 'transparencies': ''
        })

        self.assertEqual(resp.status_code, 200)

        self.assertEqual(len(resp.content), 8427)

        self.assertEqual(resp['Content-Type'], 'pdf')

    def test_projectdetails_view(self):
        resp = self.client.get(reverse('projectdetails'), {
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs'
        })

        self.assertEqual(resp.status_code, 200)

        self.assertEqual(resp['Content-Type'], 'application/json')

        self.assertEqual(len(resp.content), 628)

    def test_projectdetails_view_mising_params(self):
        resp = self.client.get(reverse('projectdetails'))

        self.assertEqual(resp.status_code, 404)

    def test_projectdetails_view_bad_params(self):
        resp = self.client.get(reverse('projectdetails'), {
            'map': ''
        })

        self.assertEqual(resp.status_code, 404)
