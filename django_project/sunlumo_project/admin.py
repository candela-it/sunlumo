# -*- coding: utf-8 -*-
from django.contrib import admin

from .models import Project, Layer, Attribute


class ProjectModelAdmin(admin.ModelAdmin):
    pass

admin.site.register(Project, ProjectModelAdmin)


class LayerModelAdmin(admin.ModelAdmin):
    pass

admin.site.register(Layer, LayerModelAdmin)


class AttributeModelAdmin(admin.ModelAdmin):
    list_filter = ('layer__title', 'layer__project__title')
    fields = ('name', 'visible', 'identifier')
    list_display = ('name', 'visible', 'identifier')

admin.site.register(Attribute, AttributeModelAdmin)

