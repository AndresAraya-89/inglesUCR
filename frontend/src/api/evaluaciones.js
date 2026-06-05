import { apiClient } from './client.js';

// --- Estudiante: resolución de quiz (RF-19 a RF-22) ---
export const obtenerQuiz = (leccionId) =>
  apiClient.get(`/lecciones/${leccionId}/quiz/`);

export const iniciarIntento = (quizId) =>
  apiClient.post('/intentos/', { quiz: quizId });

export const enviarRespuesta = (intentoId, payload) =>
  apiClient.post(`/intentos/${intentoId}/respuestas/`, payload);

export const finalizarIntento = (intentoId) =>
  apiClient.post(`/intentos/${intentoId}/finalizar/`);

export const historial = () => apiClient.get('/intentos/');

export const obtenerIntento = (id) => apiClient.get(`/intentos/${id}/`);

// --- Admin: constructor de quizzes (RF-12 a RF-15) ---
export const listarQuizes = (params) => apiClient.get('/quizes/', { params });

export const obtenerQuizAdmin = (id) => apiClient.get(`/quizes/${id}/`);

export const crearQuiz = (data) => apiClient.post('/quizes/', data);

export const actualizarQuiz = (id, data) => apiClient.put(`/quizes/${id}/`, data);

export const eliminarQuiz = (id) => apiClient.delete(`/quizes/${id}/`);
