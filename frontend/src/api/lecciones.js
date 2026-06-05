import { apiClient } from './client.js';

export const listarLecciones = (params) =>
  apiClient.get('/lecciones/', { params });

export const obtenerLeccion = (id) => apiClient.get(`/lecciones/${id}/`);

export const crearLeccion = (data) => apiClient.post('/lecciones/', data);

export const actualizarLeccion = (id, data) =>
  apiClient.patch(`/lecciones/${id}/`, data);

export const eliminarLeccion = (id) => apiClient.delete(`/lecciones/${id}/`);
