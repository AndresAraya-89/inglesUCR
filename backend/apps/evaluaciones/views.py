from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.lecciones.models import Leccion
from apps.usuarios.permissions import EsAdmin, EsEstudiante

from .grading import calcular_puntaje_total, evaluar_respuesta
from .models import Intento, Quiz, Respuesta
from .serializers import (
    EnviarRespuestaSerializer,
    IniciarIntentoSerializer,
    IntentoDetailSerializer,
    IntentoSerializer,
    QuizAdminSerializer,
    QuizPublicSerializer,
    RespuestaResultadoSerializer,
)


class QuizViewSet(viewsets.ModelViewSet):
    """CRUD de Quizes para el administrador (RF-12 a RF-15).

    Construye un quiz completo (preguntas + opciones) en una sola petición.
    Solo accesible por administradores; el estudiante obtiene el quiz vía
    `/lecciones/{id}/quiz/`.
    """

    queryset = Quiz.objects.all().prefetch_related("preguntas__opciones")
    serializer_class = QuizAdminSerializer
    permission_classes = [IsAuthenticated, EsAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        leccion_id = self.request.query_params.get("leccion")
        if leccion_id:
            qs = qs.filter(leccion_id=leccion_id)
        return qs


class QuizDeLeccionView(viewsets.ViewSet):
    """GET /api/v1/lecciones/{id}/quiz/ — entrega el quiz al estudiante (RF-19)."""

    permission_classes = [IsAuthenticated]

    def retrieve(self, request, leccion_id=None):
        leccion = get_object_or_404(Leccion, pk=leccion_id, publicada=True)
        quiz = (
            leccion.quizes.prefetch_related("preguntas__opciones").first()
        )
        if not quiz:
            return Response(
                {"detail": "La lección no tiene un quiz asociado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(QuizPublicSerializer(quiz).data)


class IntentoViewSet(viewsets.ViewSet):
    """Flujo de resolución de quiz (RF-19 a RF-22).

    Un intento pertenece siempre al estudiante autenticado; todas las acciones
    filtran por `estudiante=request.user`, de modo que nadie puede operar sobre
    intentos ajenos.
    """

    permission_classes = [IsAuthenticated, EsEstudiante]

    def _intentos_del_usuario(self, request):
        return Intento.objects.filter(estudiante=request.user).select_related("quiz")

    def list(self, request):
        """RF-22: historial propio."""
        intentos = self._intentos_del_usuario(request)
        return Response(IntentoSerializer(intentos, many=True).data)

    def retrieve(self, request, pk=None):
        """RF-22: detalle de un intento con sus respuestas."""
        intento = get_object_or_404(
            self._intentos_del_usuario(request).prefetch_related("respuestas"),
            pk=pk,
        )
        return Response(IntentoDetailSerializer(intento).data)

    def create(self, request):
        """Iniciar intento sobre un quiz de una lección publicada."""
        serializer = IniciarIntentoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quiz = serializer.validated_data["quiz"]
        intento = Intento.objects.create(estudiante=request.user, quiz=quiz)
        return Response(
            IntentoSerializer(intento).data, status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["post"], url_path="respuestas")
    def enviar_respuesta(self, request, pk=None):
        """RF-20: registra una respuesta y devuelve feedback inmediato."""
        intento = get_object_or_404(
            self._intentos_del_usuario(request), pk=pk, completado=False
        )
        serializer = EnviarRespuestaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        pregunta = serializer.validated_data["pregunta"]
        opcion = serializer.validated_data.get("opcion")
        texto = serializer.validated_data.get("respuesta_texto", "")

        # Integridad: la pregunta debe pertenecer al quiz de este intento.
        if pregunta.quiz_id != intento.quiz_id:
            raise ValidationError(
                {"pregunta": "La pregunta no pertenece al quiz de este intento."}
            )

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
        """RF-21: calcula la sumatoria y cierra el intento (idempotente)."""
        with transaction.atomic():
            intento = get_object_or_404(
                self._intentos_del_usuario(request).select_for_update(), pk=pk
            )
            if not intento.completado:
                intento.puntaje_total = calcular_puntaje_total(intento)
                intento.completado = True
                intento.fecha_fin = timezone.now()
                intento.save(
                    update_fields=["puntaje_total", "completado", "fecha_fin"]
                )
        return Response(IntentoSerializer(intento).data)
