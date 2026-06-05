from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from apps.usuarios.permissions import EsAdmin

from .models import Concepto
from .serializers import ConceptoSerializer


class ConceptoViewSet(viewsets.ModelViewSet):
    """CRUD de Conceptos (RF-06 a RF-10).

    - Lectura: cualquier usuario autenticado.
    - Escritura: solo administradores.
    - Búsqueda por palabra o categoría (RF-09): `?search=...`.
    """

    queryset = Concepto.objects.all()
    serializer_class = ConceptoSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["palabra_ingles", "categoria"]

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [IsAuthenticated()]
        return [IsAuthenticated(), EsAdmin()]

    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user)
