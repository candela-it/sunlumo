# -*- coding: utf-8 -*-
from django.contrib import admin

from .models import IndexSpecification, IndexAttribute


class IndexAttributeModelAdmin(admin.ModelAdmin):
    raw_id_fields = ['attribute']
    list_filter = ('attribute__layer__title', )
    list_display = ('attribute', 'primary_key', 'ordering')
    ordering = ['ordering']

admin.site.register(IndexAttribute, IndexAttributeModelAdmin)


class IndexSpecificationModelAdmin(admin.ModelAdmin):
    pass


admin.site.register(IndexSpecification, IndexSpecificationModelAdmin)
