from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import IntentoViewSet, QuizDeLeccionView

router = DefaultRouter()
router.register(r"intentos", IntentoViewSet, basename="intento")

urlpatterns = [
    path(
        "lecciones/<int:leccion_id>/quiz/",
        QuizDeLeccionView.as_view({"get": "retrieve"}),
        name="quiz-leccion",
    ),
] + router.urls
