from django.urls import path

from .views import PerfilView, RegistroEstudianteView

urlpatterns = [
    path("register/", RegistroEstudianteView.as_view(), name="registro"),
    path("me/", PerfilView.as_view(), name="perfil"),
]
