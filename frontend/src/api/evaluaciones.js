import { apiClient } from './client.js';

export const obtenerQuiz = (leccionId) =>
  apiClient.get(`/lecciones/${leccionId}/quiz/`);

export const iniciarIntento = (quizId) =>
  apiClient.post('/intentos/', { quiz: quizId });

export const enviarRespuesta = (intentoId, payload) =>
  apiClient.post(`/intentos/${intentoId}/respuestas/`, payload);

export const finalizarIntento = (intentoId) =>
  apiClient.post(`/intentos/${intentoId}/finalizar/`);

export const historial = () => apiClient.get('/intentos/');
