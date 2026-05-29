from django.conf import settings
from django.db import models


class Concepto(models.Model):
    """Unidad atómica de aprendizaje (RF-06)."""

    palabra_ingles = models.CharField(max_length=120)
    transcripcion_fonetica = models.CharField(max_length=200)
    imagen = models.ImageField(upload_to="imagenes/")
    audio = models.FileField(upload_to="audios/")
    categoria = models.CharField(max_length=80, blank=True)
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="conceptos_creados",
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Concepto"
        verbose_name_plural = "Conceptos"
        ordering = ["palabra_ingles"]

    def __str__(self) -> str:
        return self.palabra_ingles
