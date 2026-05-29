"""Permisos RBAC reutilizables (RF-04)."""
from rest_framework.permissions import BasePermission


class EsAdmin(BasePermission):
    message = "Se requiere rol de administrador."

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.es_admin
        )


class EsEstudiante(BasePermission):
    message = "Se requiere rol de estudiante."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.es_estudiante
        )
