from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.usuarios.permissions import EsAdmin

from .models import Leccion
from .serializers import LeccionDetailSerializer, LeccionListSerializer


class LeccionViewSet(viewsets.ModelViewSet):
    """Catálogo y CRUD de Lecciones (RF-11, RF-16, RF-17)."""

    queryset = Leccion.objects.all()

    def get_serializer_class(self):
        if self.action == "list":
            return LeccionListSerializer
        return LeccionDetailSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_authenticated and self.request.user.es_estudiante:
            return qs.filter(publicada=True)
        return qs

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [IsAuthenticated()]
        return [IsAuthenticated(), EsAdmin()]

    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user)
