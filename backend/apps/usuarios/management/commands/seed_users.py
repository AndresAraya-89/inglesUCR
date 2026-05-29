"""Crea usuarios de prueba (admin + estudiante) para entornos de desarrollo.

Uso:
    python manage.py seed_users
"""
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

Usuario = get_user_model()

USUARIOS_DEMO = [
    {
        "email": "admin@ucr.ac.cr",
        "username": "admin",
        "password": "Admin1234",
        "first_name": "Admin",
        "last_name": "UCR",
        "rol": "admin",
        "is_staff": True,
        "is_superuser": True,
    },
    {
        "email": "estudiante@ucr.ac.cr",
        "username": "estudiante",
        "password": "Estudiante1234",
        "first_name": "Estudiante",
        "last_name": "Demo",
        "rol": "estudiante",
        "is_staff": False,
        "is_superuser": False,
    },
]


class Command(BaseCommand):
    help = "Crea usuarios de prueba (admin y estudiante) si no existen."

    def handle(self, *args, **options):
        for datos in USUARIOS_DEMO:
            password = datos.pop("password")
            usuario, creado = Usuario.objects.get_or_create(
                email=datos["email"], defaults=datos
            )
            if creado:
                usuario.set_password(password)
                usuario.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        f"[OK] Creado: {usuario.email} (rol={usuario.rol})"
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"[--] Ya existía: {usuario.email}")
                )

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("Credenciales de prueba:"))
        self.stdout.write("  Admin       → admin@ucr.ac.cr        / Admin1234")
        self.stdout.write("  Estudiante  → estudiante@ucr.ac.cr   / Estudiante1234")
