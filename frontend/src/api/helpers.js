/**
 * Desempaqueta una respuesta de lista de DRF.
 * Soporta tanto respuestas paginadas (`{ count, results }`) como arrays planos.
 */
export const unwrapLista = (data) =>
  Array.isArray(data) ? data : data?.results ?? [];

/** Extrae un mensaje de error legible desde una respuesta de axios. */
export const mensajeError = (error, porDefecto = 'Ocurrió un error.') => {
  const data = error?.response?.data;
  if (!data) return error?.message || porDefecto;
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  // Errores de validación de DRF: { campo: [mensajes] }
  const primero = Object.values(data)[0];
  if (Array.isArray(primero)) return primero[0];
  if (typeof primero === 'string') return primero;
  return porDefecto;
};
