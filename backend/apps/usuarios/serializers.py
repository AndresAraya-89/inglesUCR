from django.contrib.auth import get_user_model
from rest_framework import serializers

Usuario = get_user_model()


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ("id", "email", "username", "first_name", "last_name", "rol")
        read_only_fields = ("id", "rol")


class RegistroEstudianteSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Usuario
        fields = ("email", "username", "first_name", "last_name", "password")

    def create(self, validated_data):
        password = validated_data.pop("password")
        usuario = Usuario(**validated_data, rol="estudiante")
        usuario.set_password(password)
        usuario.save()
        return usuario
