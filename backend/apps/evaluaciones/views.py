from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.lecciones.models import Leccion
from apps.usuarios.permissions import EsEstudiante

from .grading import calcular_puntaje_total, evaluar_respuesta
from .models import Intento, Pregunta, Quiz, Respuesta
from .serializers import (
    EnviarRespuestaSerializer,
    IntentoSerializer,
    QuizPublicSerializer,
    RespuestaResultadoSerializer,
)


class QuizDeLeccionView(viewsets.ViewSet):
    """GET /api/v1/lecciones/{id}/quiz/ — entrega el quiz al estudiante (RF-19)."""

    permission_classes = [IsAuthenticated]

    def retrieve(self, request, leccion_id=None):
        leccion = get_object_or_404(Leccion, pk=leccion_id, publicada=True)
        quiz = leccion.quizes.first()
        if not quiz:
            return Response({"detail": "Sin quiz"}, status=status.HTTP_404_NOT_FOUND)
        return Response(QuizPublicSerializer(quiz).data)


class IntentoViewSet(viewsets.ViewSet):
    """Flujo de resolución de quiz (RF-19 a RF-22)."""

    permission_classes = [IsAuthenticated, EsEstudiante]

    def list(self, request):
        """RF-22: historial propio."""
        intentos = Intento.objects.filter(estudiante=request.user)
        return Response(IntentoSerializer(intentos, many=True).data)

    def create(self, request):
        """Iniciar intento."""
        quiz_id = request.data.get("quiz")
        quiz = get_object_or_404(Quiz, pk=quiz_id)
        intento = Intento.objects.create(estudiante=request.user, quiz=quiz)
        return Response(
            IntentoSerializer(intento).data, status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["post"], url_path="respuestas")
    def enviar_respuesta(self, request, pk=None):
        """RF-20: registra respuesta y devuelve feedback inmediato."""
        intento = get_object_or_404(
            Intento, pk=pk, estudiante=request.user, completado=False
        )
        serializer = EnviarRespuestaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        pregunta: Pregunta = serializer.validated_data["pregunta"]
        opcion = serializer.validated_data.get("opcion")
        texto = serializer.validated_data.get("respuesta_texto", "")

        es_correcta, puntos = evaluar_respuesta(pregunta, opcion, texto)

        respuesta, _ = Respuesta.objects.update_or_create(
            intento=intento,
            pregunta=pregunta,
            defaults={
                "opcion": opcion,
                "respuesta_texto": texto,
                "es_correcta": es_correcta,
                "puntos_obtenidos": puntos,
            },
        )
        return Response(RespuestaResultadoSerializer(respuesta).data)

    @action(detail=True, methods=["post"], url_path="finalizar")
    def finalizar(self, request, pk=None):
        """RF-21: calcula sumatoria y cierra el intento."""
        intento = get_object_or_404(Intento, pk=pk, estudiante=request.user)
        intento.puntaje_total = calcular_puntaje_total(intento)
        intento.completado = True
        intento.fecha_fin = timezone.now()
        intento.save()
        return Response(IntentoSerializer(intento).data)
