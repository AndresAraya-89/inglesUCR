from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.usuarios.permissions import EsAdmin

from .models import Concepto
from .serializers import ConceptoSerializer


class ConceptoViewSet(viewsets.ModelViewSet):
    """CRUD de Conceptos (RF-06 a RF-10).

    - Lectura: cualquier usuario autenticado.
    - Escritura: solo administradores.
    """

    queryset = Concepto.objects.all()
    serializer_class = ConceptoSerializer

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [IsAuthenticated()]
        return [IsAuthenticated(), EsAdmin()]

    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user)
