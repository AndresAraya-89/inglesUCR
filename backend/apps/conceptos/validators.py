"""Validadores de archivos multimedia (RNF-17, RNF-18, RNF-23).

Se validan por extensión y tamaño máximo. Son clases ``@deconstructible`` para
que Django pueda serializarlas en las migraciones.
"""
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.utils.deconstruct import deconstructible

# RNF-17 / RNF-18: formatos aceptados.
EXTENSIONES_IMAGEN = ["jpg", "jpeg", "png", "webp"]
EXTENSIONES_AUDIO = ["mp3", "wav", "ogg"]

# RNF-23: tamaño máximo por tipo de archivo.
TAMANO_MAX_IMAGEN_MB = 5
TAMANO_MAX_AUDIO_MB = 10


@deconstructible
class TamanoMaximoArchivo:
    """Valida que el archivo no supere ``max_mb`` megabytes."""

    def __init__(self, max_mb: int):
        self.max_mb = max_mb

    def __call__(self, archivo):
        limite = self.max_mb * 1024 * 1024
        if archivo.size > limite:
            raise ValidationError(
                f"El archivo supera el tamaño máximo de {self.max_mb} MB."
            )

    def __eq__(self, other):
        return isinstance(other, TamanoMaximoArchivo) and self.max_mb == other.max_mb


validar_imagen_extension = FileExtensionValidator(allowed_extensions=EXTENSIONES_IMAGEN)
validar_audio_extension = FileExtensionValidator(allowed_extensions=EXTENSIONES_AUDIO)
validar_tamano_imagen = TamanoMaximoArchivo(TAMANO_MAX_IMAGEN_MB)
validar_tamano_audio = TamanoMaximoArchivo(TAMANO_MAX_AUDIO_MB)
