import { apiClient } from './client.js';

export const login = (email, password) =>
  apiClient.post('/auth/login/', { email, password });

export const registro = (data) => apiClient.post('/auth/register/', data);

export const perfil = () => apiClient.get('/auth/me/');
