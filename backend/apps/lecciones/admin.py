from django.contrib import admin

from .models import Leccion, LeccionConcepto


class LeccionConceptoInline(admin.TabularInline):
    model = LeccionConcepto
    extra = 1


@admin.register(Leccion)
class LeccionAdmin(admin.ModelAdmin):
    list_display = ("titulo", "nivel", "orden", "publicada", "creado_por")
    list_filter = ("nivel", "publicada")
    search_fields = ("titulo",)
    inlines = [LeccionConceptoInline]
