from django.conf import settings
from django.db import models

from apps.conceptos.models import Concepto


class Nivel(models.TextChoices):
    A1 = "A1", "A1"
    A2 = "A2", "A2"
    B1 = "B1", "B1"
    B2 = "B2", "B2"


class Leccion(models.Model):
    """Agrupación temática de Conceptos (RF-11)."""

    titulo = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    nivel = models.CharField(max_length=2, choices=Nivel.choices, default=Nivel.A1)
    orden = models.PositiveIntegerField(default=0)
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="lecciones_creadas",
    )
    publicada = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    conceptos = models.ManyToManyField(
        Concepto,
        through="LeccionConcepto",
        related_name="lecciones",
    )

    class Meta:
        verbose_name = "Lección"
        verbose_name_plural = "Lecciones"
        ordering = ["nivel", "orden"]

    def __str__(self) -> str:
        return f"[{self.nivel}] {self.titulo}"


class LeccionConcepto(models.Model):
    """Tabla puente con orden didáctico."""

    leccion = models.ForeignKey(Leccion, on_delete=models.CASCADE)
    concepto = models.ForeignKey(Concepto, on_delete=models.PROTECT)
    orden = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("leccion", "concepto")
        ordering = ["orden"]
