"""Pruebas del motor de evaluación (núcleo del negocio).

Cubren la regla de calificación (RF-21: 1 pt/pregunta, nota = sumatoria) y la
integridad del flujo de resolución de quizzes (RF-19 a RF-22).
"""
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.lecciones.models import Leccion
from apps.evaluaciones.grading import evaluar_respuesta
from apps.evaluaciones.models import Opcion, Pregunta, Quiz, TipoPregunta

Usuario = get_user_model()


class BaseEvaluacionTest(APITestCase):
    def setUp(self):
        self.admin = Usuario.objects.create_user(
            username="admin", email="admin@ucr.ac.cr", password="Admin1234", rol="admin"
        )
        self.estudiante = Usuario.objects.create_user(
            username="est", email="est@ucr.ac.cr", password="Est12345", rol="estudiante"
        )
        self.leccion = Leccion.objects.create(
            titulo="Saludos", nivel="A1", creado_por=self.admin, publicada=True
        )
        self.quiz = Quiz.objects.create(leccion=self.leccion, titulo="Quiz saludos")
        self.pregunta = Pregunta.objects.create(
            quiz=self.quiz,
            enunciado="¿Cómo se dice 'hola'?",
            tipo=TipoPregunta.MULTIPLE_CHOICE,
            orden=0,
        )
        self.correcta = Opcion.objects.create(
            pregunta=self.pregunta, texto="hello", es_correcta=True
        )
        self.incorrecta = Opcion.objects.create(
            pregunta=self.pregunta, texto="goodbye", es_correcta=False
        )


class GradingUnitTests(BaseEvaluacionTest):
    def test_opcion_correcta_otorga_puntos(self):
        es_correcta, puntos = evaluar_respuesta(self.pregunta, self.correcta)
        self.assertTrue(es_correcta)
        self.assertEqual(puntos, 1)

    def test_opcion_incorrecta_no_otorga_puntos(self):
        es_correcta, puntos = evaluar_respuesta(self.pregunta, self.incorrecta)
        self.assertFalse(es_correcta)
        self.assertEqual(puntos, 0)

    def test_opcion_de_otra_pregunta_no_cuenta(self):
        """Una opción correcta de OTRA pregunta no debe puntuar (integridad)."""
        otra = Pregunta.objects.create(
            quiz=self.quiz, enunciado="otra", tipo=TipoPregunta.MULTIPLE_CHOICE
        )
        opcion_ajena = Opcion.objects.create(
            pregunta=otra, texto="x", es_correcta=True
        )
        es_correcta, puntos = evaluar_respuesta(self.pregunta, opcion_ajena)
        self.assertFalse(es_correcta)
        self.assertEqual(puntos, 0)

    def test_fill_blank_es_tolerante_a_mayusculas_y_espacios(self):
        p = Pregunta.objects.create(
            quiz=self.quiz, enunciado="completar", tipo=TipoPregunta.FILL_BLANK
        )
        Opcion.objects.create(pregunta=p, texto="Good Morning", es_correcta=True)
        self.assertTrue(evaluar_respuesta(p, texto="  good   morning ")[0])
        self.assertFalse(evaluar_respuesta(p, texto="good evening")[0])


class FlujoIntentoAPITests(BaseEvaluacionTest):
    def setUp(self):
        super().setUp()
        self.client.force_authenticate(user=self.estudiante)

    def test_estudiante_resuelve_quiz_y_obtiene_sumatoria(self):
        # Iniciar intento
        r = self.client.post("/api/v1/intentos/", {"quiz": self.quiz.id})
        self.assertEqual(r.status_code, status.HTTP_201_CREATED, r.data)
        intento_id = r.data["id"]

        # Responder correctamente → feedback inmediato
        r = self.client.post(
            f"/api/v1/intentos/{intento_id}/respuestas/",
            {"pregunta": self.pregunta.id, "opcion": self.correcta.id},
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK, r.data)
        self.assertTrue(r.data["es_correcta"])

        # Finalizar → nota = sumatoria (1)
        r = self.client.post(f"/api/v1/intentos/{intento_id}/finalizar/")
        self.assertEqual(r.data["puntaje_total"], 1)
        self.assertTrue(r.data["completado"])

    def test_finalizar_es_idempotente(self):
        intento_id = self.client.post(
            "/api/v1/intentos/", {"quiz": self.quiz.id}
        ).data["id"]
        self.client.post(
            f"/api/v1/intentos/{intento_id}/respuestas/",
            {"pregunta": self.pregunta.id, "opcion": self.correcta.id},
        )
        primero = self.client.post(f"/api/v1/intentos/{intento_id}/finalizar/").data
        segundo = self.client.post(f"/api/v1/intentos/{intento_id}/finalizar/").data
        self.assertEqual(primero["puntaje_total"], segundo["puntaje_total"])

    def test_no_se_puede_responder_pregunta_de_otro_quiz(self):
        otro_quiz = Quiz.objects.create(leccion=self.leccion, titulo="Otro")
        pregunta_ajena = Pregunta.objects.create(
            quiz=otro_quiz, enunciado="ajena", tipo=TipoPregunta.MULTIPLE_CHOICE
        )
        intento_id = self.client.post(
            "/api/v1/intentos/", {"quiz": self.quiz.id}
        ).data["id"]
        r = self.client.post(
            f"/api/v1/intentos/{intento_id}/respuestas/",
            {"pregunta": pregunta_ajena.id},
        )
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_no_se_puede_iniciar_intento_en_leccion_no_publicada(self):
        leccion_oculta = Leccion.objects.create(
            titulo="Oculta", nivel="A1", creado_por=self.admin, publicada=False
        )
        quiz_oculto = Quiz.objects.create(leccion=leccion_oculta, titulo="Q")
        r = self.client.post("/api/v1/intentos/", {"quiz": quiz_oculto.id})
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_un_estudiante_no_ve_intentos_de_otro(self):
        otro = Usuario.objects.create_user(
            username="otro", email="otro@ucr.ac.cr", password="Otro1234", rol="estudiante"
        )
        intento_id = self.client.post(
            "/api/v1/intentos/", {"quiz": self.quiz.id}
        ).data["id"]
        self.client.force_authenticate(user=otro)
        r = self.client.get(f"/api/v1/intentos/{intento_id}/")
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)


class PermisosQuizAPITests(BaseEvaluacionTest):
    def test_estudiante_no_puede_crear_quiz(self):
        self.client.force_authenticate(user=self.estudiante)
        r = self.client.post(
            "/api/v1/quizes/", {"leccion": self.leccion.id, "titulo": "X"}, format="json"
        )
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_crea_quiz_con_preguntas_anidadas(self):
        self.client.force_authenticate(user=self.admin)
        payload = {
            "leccion": self.leccion.id,
            "titulo": "Nuevo quiz",
            "preguntas": [
                {
                    "enunciado": "¿hola?",
                    "tipo": "multiple_choice",
                    "opciones": [
                        {"texto": "hello", "es_correcta": True},
                        {"texto": "bye", "es_correcta": False},
                    ],
                }
            ],
        }
        r = self.client.post("/api/v1/quizes/", payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED, r.data)

    def test_validacion_rechaza_seleccion_sin_opcion_correcta(self):
        self.client.force_authenticate(user=self.admin)
        payload = {
            "leccion": self.leccion.id,
            "titulo": "Inválido",
            "preguntas": [
                {
                    "enunciado": "¿hola?",
                    "tipo": "multiple_choice",
                    "opciones": [
                        {"texto": "hello", "es_correcta": False},
                        {"texto": "bye", "es_correcta": False},
                    ],
                }
            ],
        }
        r = self.client.post("/api/v1/quizes/", payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
