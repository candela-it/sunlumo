# -*- coding: utf-8 -*-

from django.test import TestCase, Client
from django.core.urlresolvers import reverse


class TestViews(TestCase):
    def setUp(self):
        self.client = Client()

    def test_mapview_view(self):
        resp = self.client.get(reverse('mapview'))

        self.assertEqual(resp.status_code, 200)

        self.assertListEqual(
            [tmpl.name for tmpl in resp.templates], [
                'mapview.html', u'base.html'
            ]
        )

    def test_getmap_view_mising_params(self):
        resp = self.client.get(reverse('getmap'))

        self.assertEqual(resp.status_code, 404)

    def test_getmap_view_bad_params(self):
        # bad bbox
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-a,-b,c,d', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png', 'layers': 'polygons,lines,points'
        })

        self.assertEqual(resp.status_code, 404)

        # bad heigth
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 'a', 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png', 'layers': 'polygons,lines,points'
        })

        self.assertEqual(resp.status_code, 404)

        # bad width
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 'b', 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png', 'layers': 'polygons,lines,points'
        })

        self.assertEqual(resp.status_code, 404)

        # bad srs
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 'a',
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png', 'layers': 'polygons,lines,points'
        })

        self.assertEqual(resp.status_code, 404)

        # missing map parameter
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': '', 'format': 'image/png', 'layers': 'polygons,lines,points'
        })

        self.assertEqual(resp.status_code, 404)

        # unknown image format
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/unknown', 'layers': 'polygons,lines,points'
        })

        self.assertEqual(resp.status_code, 404)

        # unparsable image format
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'some_weird_format', 'layers': 'polygons,lines,points'
        })

        self.assertEqual(resp.status_code, 404)

        # missing layers param
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png'
        })

        self.assertEqual(resp.status_code, 404)

        # layers param empty
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png', 'layers': ''
        })

        self.assertEqual(resp.status_code, 404)

    def test_getmap_view(self):
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png', 'layers': 'polygons,lines,points'
        })

        self.assertEqual(resp.status_code, 200)

        self.assertEqual(len(resp.content), 6168)

        self.assertEqual(resp['Content-Type'], 'png')

    def test_getmap_view_layers(self):
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png', 'layers': 'points,polygons'
        })

        self.assertEqual(resp.status_code, 200)

        self.assertEqual(len(resp.content), 4745)

        self.assertEqual(resp['Content-Type'], 'png')

    def test_getmap_view_bgcolor(self):
        resp = self.client.get(reverse('getmap'), {
            'bbox': '-2,-2,2,2', 'width': 100, 'height': 100, 'srs': 4326,
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'format': 'image/png', 'bgcolor': 'FFFFFF', 'transparent': 'TRUE',
            'layers': 'polygons,lines,points'
        })

        self.assertEqual(resp.status_code, 200)

        self.assertEqual(len(resp.content), 5311)

        self.assertEqual(resp['Content-Type'], 'png')

    def test_printpdf_view_mising_params(self):
        resp = self.client.get(reverse('printpdf'))

        self.assertEqual(resp.status_code, 404)

    def test_printpdf_view_bad_params(self):
        resp = self.client.get(reverse('printpdf'), {
            'bbox': '-a,-b,c,d', 'layout': 'test_layout',
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'layers': 'polygons,lines,points'
        })

        self.assertEqual(resp.status_code, 404)

        resp = self.client.get(reverse('printpdf'), {
            'bbox': '-2,-2,2,2', 'layout': '',
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'layers': 'polygons,lines,points'
        })

        self.assertEqual(resp.status_code, 404)

        resp = self.client.get(reverse('printpdf'), {
            'bbox': '-2,-2,2,2', 'layout': 'test_layout',
            'map': '', 'layers': 'polygons,lines,points'
        })

        self.assertEqual(resp.status_code, 404)

        # missing layers
        resp = self.client.get(reverse('printpdf'), {
            'bbox': '-2,-2,2,2', 'layout': 'test_layout',
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs'
        })

        self.assertEqual(resp.status_code, 404)

        # missing layers
        resp = self.client.get(reverse('printpdf'), {
            'bbox': '-2,-2,2,2', 'layout': 'test_layout',
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'layers': ''
        })

        self.assertEqual(resp.status_code, 404)

    def test_printpdf_view(self):
        resp = self.client.get(reverse('printpdf'), {
            'bbox': '-2,-2,2,2', 'layout': 'test_layout',
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'layers': 'polygons,lines,points'
        })

        self.assertEqual(resp.status_code, 200)

        self.assertEqual(len(resp.content), 243851)

        self.assertEqual(resp['Content-Type'], 'pdf')

    def test_printpdf_view_layers(self):
        resp = self.client.get(reverse('printpdf'), {
            'bbox': '-2,-2,2,2', 'layout': 'test_layout',
            'map': './sunlumo_mapserver/test_data/test_sunlumo.qgs',
            'layers': 'polygons,lines'
        })

        self.assertEqual(resp.status_code, 200)

        self.assertEqual(len(resp.content), 230765)

        self.assertEqual(resp['Content-Type'], 'pdf')
