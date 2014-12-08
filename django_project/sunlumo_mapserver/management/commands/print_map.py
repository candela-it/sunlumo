# -*- coding: utf-8 -*-
import json

from django.core.management.base import BaseCommand, CommandError

from ...printer import Printer


class Command(BaseCommand):

    args = '<param_file>'
    help = 'Print SunLumo project to PDF'

    def handle(self, *args, **options):

        if len(args) != 1:
            raise CommandError('Missing required arguments')

        param_file = args[0]

        with open(param_file, 'r') as paramFile:
            params = json.load(paramFile)

        params['tmpFile'] = param_file
        prnt = Printer(params['map_file'])
        prnt.printToPdf(params)
