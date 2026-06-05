from django.db import transaction
from rest_framework import serializers

from .models import Intento, Opcion, Pregunta, Quiz, Respuesta, TipoPregunta

# Tipos de pregunta que requieren opciones de selección.
_TIPOS_SELECCION_UNICA = {TipoPregunta.MULTIPLE_CHOICE, TipoPregunta.LISTENING}


# ---------------------------------------------------------------------------
# Serializers de administración (RF-12 a RF-15)
# Permiten construir un Quiz completo (preguntas + opciones) en una sola
# petición desde el QuizBuilder del panel de administrador.
# ---------------------------------------------------------------------------


class OpcionAdminSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Opcion
        fields = ("id", "texto", "es_correcta")


class PreguntaAdminSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    opciones = OpcionAdminSerializer(many=True, required=False)

    class Meta:
        model = Pregunta
        fields = ("id", "enunciado", "tipo", "puntos", "orden", "concepto", "opciones")

    def validate(self, attrs):
        """Garantiza coherencia entre el tipo de pregunta y sus opciones."""
        tipo = attrs.get("tipo", TipoPregunta.MULTIPLE_CHOICE)
        opciones = attrs.get("opciones", [])
        correctas = [o for o in opciones if o.get("es_correcta")]

        if tipo in _TIPOS_SELECCION_UNICA:
            if len(opciones) < 2:
                raise serializers.ValidationError(
                    "Una pregunta de selección requiere al menos 2 opciones."
                )
            if len(correctas) != 1:
                raise serializers.ValidationError(
                    "Una pregunta de selección requiere exactamente 1 opción correcta."
                )
        elif tipo == TipoPregunta.MATCHING:
            if not correctas:
                raise serializers.ValidationError(
                    "Una pregunta de emparejamiento requiere al menos 1 opción correcta."
                )
        elif tipo == TipoPregunta.FILL_BLANK:
            if len(correctas) != 1:
                raise serializers.ValidationError(
                    "Una pregunta de completar requiere exactamente 1 respuesta correcta."
                )
        return attrs


class QuizAdminSerializer(serializers.ModelSerializer):
    """Serializer escribible con preguntas y opciones anidadas."""

    preguntas = PreguntaAdminSerializer(many=True, required=False)

    class Meta:
        model = Quiz
        fields = ("id", "leccion", "titulo", "descripcion", "fecha_creacion", "preguntas")
        read_only_fields = ("id", "fecha_creacion")

    @transaction.atomic
    def create(self, validated_data):
        preguntas = validated_data.pop("preguntas", [])
        quiz = Quiz.objects.create(**validated_data)
        self._sync_preguntas(quiz, preguntas)
        return quiz

    @transaction.atomic
    def update(self, instance, validated_data):
        preguntas = validated_data.pop("preguntas", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if preguntas is not None:
            # Estrategia de "reemplazo total": el builder envía el set completo.
            instance.preguntas.all().delete()
            self._sync_preguntas(instance, preguntas)
        return instance

    def _sync_preguntas(self, quiz, preguntas):
        for orden, pregunta in enumerate(preguntas):
            opciones = pregunta.pop("opciones", [])
            pregunta.pop("id", None)
            pregunta.setdefault("orden", orden)
            obj = Pregunta.objects.create(quiz=quiz, **pregunta)
            for opcion in opciones:
                opcion.pop("id", None)
                Opcion.objects.create(pregunta=obj, **opcion)


# ---------------------------------------------------------------------------
# Serializers públicos para el estudiante (RF-19): nunca revelan la opción
# correcta, la calificación es exclusivamente server-side.
# ---------------------------------------------------------------------------


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
    total_preguntas = serializers.IntegerField(
        source="preguntas.count", read_only=True
    )

    class Meta:
        model = Quiz
        fields = (
            "id",
            "titulo",
            "descripcion",
            "leccion",
            "total_preguntas",
            "preguntas",
        )


# ---------------------------------------------------------------------------
# Flujo de resolución (RF-19 a RF-22)
# ---------------------------------------------------------------------------


class IniciarIntentoSerializer(serializers.Serializer):
    quiz = serializers.PrimaryKeyRelatedField(queryset=Quiz.objects.all())

    def validate_quiz(self, quiz):
        # RF-16/RF-17: solo se evalúan lecciones publicadas.
        if not quiz.leccion.publicada:
            raise serializers.ValidationError(
                "El quiz pertenece a una lección no publicada."
            )
        return quiz


class EnviarRespuestaSerializer(serializers.Serializer):
    pregunta = serializers.PrimaryKeyRelatedField(queryset=Pregunta.objects.all())
    opcion = serializers.PrimaryKeyRelatedField(
        queryset=Opcion.objects.all(), required=False, allow_null=True
    )
    respuesta_texto = serializers.CharField(
        required=False, allow_blank=True, default=""
    )

    def validate(self, attrs):
        pregunta = attrs["pregunta"]
        opcion = attrs.get("opcion")
        if opcion is not None and opcion.pregunta_id != pregunta.id:
            raise serializers.ValidationError(
                {"opcion": "La opción no pertenece a la pregunta indicada."}
            )
        return attrs


class RespuestaResultadoSerializer(serializers.ModelSerializer):
    """Feedback inmediato tras enviar una respuesta (RF-20)."""

    class Meta:
        model = Respuesta
        fields = ("pregunta", "opcion", "es_correcta", "puntos_obtenidos")


class IntentoSerializer(serializers.ModelSerializer):
    quiz_titulo = serializers.CharField(source="quiz.titulo", read_only=True)
    total_preguntas = serializers.IntegerField(
        source="quiz.preguntas.count", read_only=True
    )

    class Meta:
        model = Intento
        fields = (
            "id",
            "quiz",
            "quiz_titulo",
            "fecha_inicio",
            "fecha_fin",
            "puntaje_total",
            "total_preguntas",
            "completado",
        )
        read_only_fields = fields


class IntentoDetailSerializer(IntentoSerializer):
    """Detalle de un intento con sus respuestas (RF-22)."""

    respuestas = RespuestaResultadoSerializer(many=True, read_only=True)

    class Meta(IntentoSerializer.Meta):
        fields = IntentoSerializer.Meta.fields + ("respuestas",)
        read_only_fields = fields
