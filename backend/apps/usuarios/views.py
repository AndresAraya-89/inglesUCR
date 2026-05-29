from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import RegistroEstudianteSerializer, UsuarioSerializer


class RegistroEstudianteView(generics.CreateAPIView):
    """RF-05: autoregistro de estudiante."""

    serializer_class = RegistroEstudianteSerializer
    permission_classes = [permissions.AllowAny]


class PerfilView(APIView):
    """Devuelve el perfil del usuario autenticado."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UsuarioSerializer(request.user).data)
