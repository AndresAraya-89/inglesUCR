from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import IntentoViewSet, QuizDeLeccionView, QuizViewSet

router = DefaultRouter()
router.register(r"intentos", IntentoViewSet, basename="intento")
router.register(r"quizes", QuizViewSet, basename="quiz")

urlpatterns = [
    path(
        "lecciones/<int:leccion_id>/quiz/",
        QuizDeLeccionView.as_view({"get": "retrieve"}),
        name="quiz-leccion",
    ),
] + router.urls
