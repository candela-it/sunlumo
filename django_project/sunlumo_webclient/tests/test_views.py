# -*- coding: utf-8 -*-

from django.test import TestCase, Client
from django.core.urlresolvers import reverse


class TestViews(TestCase):
    def setUp(self):
        self.client = Client()

    def test_mapview_view(self):
        resp = self.client.get(reverse('index'))

        self.assertEqual(resp.status_code, 200)

        self.assertListEqual(
            [tmpl.name for tmpl in resp.templates], [
                'index.html', u'base.html'
            ]
        )
