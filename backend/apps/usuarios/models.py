from django.contrib.auth.models import AbstractUser
from django.db import models


class Rol(models.TextChoices):
    ADMIN = "admin", "Administrador"
    ESTUDIANTE = "estudiante", "Estudiante"


class Usuario(AbstractUser):
    """Usuario base del sistema. Diferenciado por `rol` para RBAC (RF-04)."""

    email = models.EmailField(unique=True)
    rol = models.CharField(
        max_length=20,
        choices=Rol.choices,
        default=Rol.ESTUDIANTE,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

    @property
    def es_admin(self) -> bool:
        return self.rol == Rol.ADMIN

    @property
    def es_estudiante(self) -> bool:
        return self.rol == Rol.ESTUDIANTE

    def __str__(self) -> str:
        return f"{self.email} ({self.rol})"
