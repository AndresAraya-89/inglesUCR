from rest_framework import serializers

from .models import Intento, Opcion, Pregunta, Quiz, Respuesta


class OpcionPublicSerializer(serializers.ModelSerializer):
    """Opciones visibles para el estudiante (sin revelar la correcta)."""

    class Meta:
        model = Opcion
        fields = ("id", "texto")


class PreguntaPublicSerializer(serializers.ModelSerializer):
    opciones = OpcionPublicSerializer(many=True, read_only=True)

    class Meta:
        model = Pregunta
        fields = ("id", "enunciado", "tipo", "puntos", "orden", "opciones")


class QuizPublicSerializer(serializers.ModelSerializer):
    preguntas = PreguntaPublicSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ("id", "titulo", "descripcion", "leccion", "preguntas")


class IniciarIntentoSerializer(serializers.Serializer):
    quiz = serializers.PrimaryKeyRelatedField(queryset=Quiz.objects.all())


class EnviarRespuestaSerializer(serializers.Serializer):
    pregunta = serializers.PrimaryKeyRelatedField(queryset=Pregunta.objects.all())
    opcion = serializers.PrimaryKeyRelatedField(
        queryset=Opcion.objects.all(), required=False, allow_null=True
    )
    respuesta_texto = serializers.CharField(required=False, allow_blank=True)


class RespuestaResultadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Respuesta
        fields = ("pregunta", "es_correcta", "puntos_obtenidos")


class IntentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Intento
        fields = (
            "id",
            "quiz",
            "fecha_inicio",
            "fecha_fin",
            "puntaje_total",
            "completado",
        )
