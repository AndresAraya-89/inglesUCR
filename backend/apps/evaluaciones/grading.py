"""Lógica de calificación (motor de evaluación automática).

Regla del proyecto (RF-21):
    - Cada pregunta vale `pregunta.puntos` (por defecto 1).
    - La nota del intento es la sumatoria de los `puntos_obtenidos` de sus
      respuestas correctas.

Toda la calificación es server-side: el estudiante nunca recibe la opción
correcta (ver `OpcionPublicSerializer`), de modo que la evaluación no es
manipulable desde el cliente.
"""
from django.db.models import Sum

from .models import Intento, Opcion, Pregunta, Respuesta, TipoPregunta

# Tipos de pregunta cuya corrección depende de elegir una `Opcion`.
TIPOS_BASADOS_EN_OPCION = {
    TipoPregunta.MULTIPLE_CHOICE,
    TipoPregunta.LISTENING,
    TipoPregunta.MATCHING,
}


def evaluar_respuesta(
    pregunta: Pregunta,
    opcion: Opcion | None = None,
    texto: str = "",
) -> tuple[bool, int]:
    """Evalúa una respuesta y devuelve ``(es_correcta, puntos_obtenidos)``.

    Una opción solo cuenta si pertenece a la pregunta evaluada; de lo
    contrario se descarta (evita que el cliente envíe la opción correcta de
    *otra* pregunta para puntuar indebidamente).
    """
    es_correcta = False

    if pregunta.tipo in TIPOS_BASADOS_EN_OPCION:
        es_correcta = bool(
            opcion is not None
            and opcion.pregunta_id == pregunta.id
            and opcion.es_correcta
        )
    elif pregunta.tipo == TipoPregunta.FILL_BLANK:
        correcta = pregunta.opciones.filter(es_correcta=True).first()
        es_correcta = bool(
            correcta and _normalizar(texto) == _normalizar(correcta.texto)
        )

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


def _normalizar(texto: str) -> str:
    """Normaliza texto para comparación tolerante (fill_blank)."""
    return " ".join(texto.strip().lower().split())
