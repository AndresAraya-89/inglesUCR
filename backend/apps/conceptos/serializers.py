from rest_framework import serializers

from .models import Concepto


class ConceptoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Concepto
        fields = (
            "id",
            "palabra_ingles",
            "transcripcion_fonetica",
            "imagen",
            "audio",
            "categoria",
            "creado_por",
            "fecha_creacion",
        )
        read_only_fields = ("id", "creado_por", "fecha_creacion")
