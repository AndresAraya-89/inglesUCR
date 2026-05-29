"""Lógica de calificación.

Regla del proyecto (RF-21):
    - Cada pregunta vale `pregunta.puntos` (por defecto 1).
    - La nota del intento es la sumatoria de los `puntos_obtenidos` de sus
      respuestas correctas.
"""
from django.db.models import Sum

from .models import Intento, Opcion, Pregunta, Respuesta, TipoPregunta


def evaluar_respuesta(
    pregunta: Pregunta,
    opcion: Opcion | None = None,
    texto: str = "",
) -> tuple[bool, int]:
    """Devuelve (es_correcta, puntos_obtenidos) para una respuesta."""
    es_correcta = False

    if pregunta.tipo in {TipoPregunta.MULTIPLE_CHOICE, TipoPregunta.LISTENING}:
        es_correcta = bool(opcion and opcion.es_correcta and opcion.pregunta_id == pregunta.id)
    elif pregunta.tipo == TipoPregunta.FILL_BLANK:
        correcta = pregunta.opciones.filter(es_correcta=True).first()
        es_correcta = bool(
            correcta and texto.strip().lower() == correcta.texto.strip().lower()
        )
    elif pregunta.tipo == TipoPregunta.MATCHING:
        es_correcta = bool(opcion and opcion.es_correcta)

    puntos = pregunta.puntos if es_correcta else 0
    return es_correcta, puntos


def calcular_puntaje_total(intento: Intento) -> int:
    """Sumatoria de puntos obtenidos en el intento (RF-21)."""
    total = (
        Respuesta.objects.filter(intento=intento).aggregate(
            total=Sum("puntos_obtenidos")
        )["total"]
        or 0
    )
    return int(total)
