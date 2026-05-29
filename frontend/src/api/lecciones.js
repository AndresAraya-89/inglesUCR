import { apiClient } from './client.js';

export const listarLecciones = () => apiClient.get('/lecciones/');
export const obtenerLeccion = (id) => apiClient.get(`/lecciones/${id}/`);
