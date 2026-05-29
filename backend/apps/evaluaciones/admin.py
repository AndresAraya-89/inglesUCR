from django.contrib import admin

from .models import Intento, Opcion, Pregunta, Quiz, Respuesta


class OpcionInline(admin.TabularInline):
    model = Opcion
    extra = 2


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ("titulo", "leccion", "fecha_creacion")


@admin.register(Pregunta)
class PreguntaAdmin(admin.ModelAdmin):
    list_display = ("quiz", "orden", "tipo", "puntos")
    list_filter = ("tipo",)
    inlines = [OpcionInline]


@admin.register(Intento)
class IntentoAdmin(admin.ModelAdmin):
    list_display = ("estudiante", "quiz", "puntaje_total", "completado", "fecha_inicio")
    list_filter = ("completado",)


admin.site.register(Respuesta)
