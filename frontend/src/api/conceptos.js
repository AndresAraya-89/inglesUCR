import { apiClient } from './client.js';

export const listarConceptos = () => apiClient.get('/conceptos/');
export const crearConcepto = (formData) =>
  apiClient.post('/conceptos/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const eliminarConcepto = (id) => apiClient.delete(`/conceptos/${id}/`);
