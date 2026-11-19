import { isAxiosError } from 'axios';

// Saca el texto de error que responde la API ({ error: "..." }); si no hay respuesta, usa el texto de respaldo.
// Un 401 significa que falta el token de sesión o venció (el login todavía no está programado).
export function mensajeError(e: unknown, respaldo: string): string {
  if (isAxiosError(e)) {
    if (e.response?.status === 401) return 'Sesión no válida: inicia sesión como administrador para ver esta pantalla.';
    const texto = (e.response?.data as { error?: string } | undefined)?.error;
    if (texto) return texto;
  }
  return respaldo;
}