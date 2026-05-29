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
        )

    def get_conceptos(self, leccion):
        relaciones = LeccionConcepto.objects.filter(leccion=leccion).select_related(
            "concepto"
        )
        return LeccionConceptoSerializer(relaciones, many=True).data
