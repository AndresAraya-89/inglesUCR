import { apiClient } from './client.js';

export const listarConceptos = (params) =>
  apiClient.get('/conceptos/', { params });

export const obtenerConcepto = (id) => apiClient.get(`/conceptos/${id}/`);

export const crearConcepto = (formData) =>
  apiClient.post('/conceptos/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const actualizarConcepto = (id, formData) =>
  apiClient.patch(`/conceptos/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const eliminarConcepto = (id) => apiClient.delete(`/conceptos/${id}/`);
