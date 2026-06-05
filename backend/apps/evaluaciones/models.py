from django.conf import settings
from django.db import models

from apps.conceptos.models import Concepto
from apps.lecciones.models import Leccion


class TipoPregunta(models.TextChoices):
    MULTIPLE_CHOICE = "multiple_choice", "Opción múltiple"
    MATCHING = "matching", "Emparejamiento"
    LISTENING = "listening", "Listening"
    FILL_BLANK = "fill_blank", "Completar"


class Quiz(models.Model):
    leccion = models.ForeignKey(
        Leccion, on_delete=models.CASCADE, related_name="quizes"
    )
    titulo = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Quiz"
        verbose_name_plural = "Quizes"
        ordering = ["id"]

    def __str__(self) -> str:
        return f"{self.titulo} ({self.leccion.titulo})"


class Pregunta(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="preguntas")
    concepto = models.ForeignKey(
        Concepto, on_delete=models.SET_NULL, null=True, blank=True
    )
    enunciado = models.TextField()
    tipo = models.CharField(
        max_length=20,
        choices=TipoPregunta.choices,
        default=TipoPregunta.MULTIPLE_CHOICE,
    )
    puntos = models.PositiveIntegerField(default=1)  # RF-21 regla 1 pt/pregunta
    orden = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["orden"]

    def __str__(self) -> str:
        return f"P{self.orden}: {self.enunciado[:40]}"


class Opcion(models.Model):
    pregunta = models.ForeignKey(
        Pregunta, on_delete=models.CASCADE, related_name="opciones"
    )
    texto = models.CharField(max_length=255)
    es_correcta = models.BooleanField(default=False)


class Intento(models.Model):
    estudiante = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="intentos"
    )
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="intentos")
    fecha_inicio = models.DateTimeField(auto_now_add=True)
    fecha_fin = models.DateTimeField(null=True, blank=True)
    puntaje_total = models.PositiveIntegerField(default=0)  # RF-21 sumatoria
    completado = models.BooleanField(default=False)

    class Meta:
        ordering = ["-fecha_inicio"]


class Respuesta(models.Model):
    intento = models.ForeignKey(
        Intento, on_delete=models.CASCADE, related_name="respuestas"
    )
    pregunta = models.ForeignKey(Pregunta, on_delete=models.PROTECT)
    opcion = models.ForeignKey(
        Opcion, on_delete=models.SET_NULL, null=True, blank=True
    )
    respuesta_texto = models.CharField(max_length=255, blank=True)
    es_correcta = models.BooleanField(default=False)
    puntos_obtenidos = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("intento", "pregunta")
