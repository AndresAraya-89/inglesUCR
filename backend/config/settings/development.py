"""Configuración de desarrollo: SQLite, DEBUG, CORS abierto al frontend."""
from .base import *  # noqa: F401,F403
import os
from dotenv import load_dotenv

load_dotenv()

DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",  # noqa: F405
    }
}

CORS_ALLOWED_ORIGINS = os.environ.get(
    "CORS_ALLOWED_ORIGINS", "http://localhost:5173"
).split(",")
