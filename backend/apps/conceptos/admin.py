from django.contrib import admin

from .models import Concepto


@admin.register(Concepto)
class ConceptoAdmin(admin.ModelAdmin):
    list_display = ("palabra_ingles", "categoria", "creado_por", "fecha_creacion")
    search_fields = ("palabra_ingles", "categoria")
    list_filter = ("categoria",)
