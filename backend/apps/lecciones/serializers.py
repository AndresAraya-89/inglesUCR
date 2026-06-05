from rest_framework import serializers

from apps.conceptos.serializers import ConceptoSerializer

from .models import Leccion, LeccionConcepto


class LeccionConceptoSerializer(serializers.ModelSerializer):
    concepto = ConceptoSerializer(read_only=True)

    class Meta:
        model = LeccionConcepto
        fields = ("concepto", "orden")


class LeccionListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leccion
        fields = ("id", "titulo", "descripcion", "nivel", "orden", "publicada")


class LeccionDetailSerializer(serializers.ModelSerializer):
    conceptos = serializers.SerializerMethodField()
    # Entrada de escritura: lista ordenada de IDs de concepto (RF-11).
    concepto_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text="IDs de conceptos en el orden didáctico deseado.",
    )

    class Meta:
        model = Leccion
        fields = (
            "id",
            "titulo",
            "descripcion",
            "nivel",
            "orden",
            "publicada",
            "fecha_creacion",
            "conceptos",
            "concepto_ids",
        )

    def get_conceptos(self, leccion):
        relaciones = LeccionConcepto.objects.filter(leccion=leccion).select_related(
            "concepto"
        )
        # `context` propaga el `request` para que ImageField/FileField generen
        # URLs absolutas (http://host/media/...) consumibles desde el frontend.
        return LeccionConceptoSerializer(
            relaciones, many=True, context=self.context
        ).data

    def create(self, validated_data):
        concepto_ids = validated_data.pop("concepto_ids", None)
        leccion = super().create(validated_data)
        if concepto_ids is not None:
            self._sync_conceptos(leccion, concepto_ids)
        return leccion

    def update(self, instance, validated_data):
        concepto_ids = validated_data.pop("concepto_ids", None)
        leccion = super().update(instance, validated_data)
        if concepto_ids is not None:
            self._sync_conceptos(leccion, concepto_ids)
        return leccion

    def _sync_conceptos(self, leccion, concepto_ids):
        """Reemplaza el set de conceptos de la lección conservando el orden."""
        LeccionConcepto.objects.filter(leccion=leccion).delete()
        LeccionConcepto.objects.bulk_create(
            [
                LeccionConcepto(leccion=leccion, concepto_id=cid, orden=orden)
                for orden, cid in enumerate(concepto_ids)
            ]
        )
