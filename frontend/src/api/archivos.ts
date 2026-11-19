import { API_URL } from './cliente';

// La API guarda las imágenes como ruta pública (ej. /uploads/imagenes/123-ab.jpg), sin dominio.
// Los archivos se sirven en la raíz de la API, no bajo /api: http://localhost:3000/uploads/imagenes/123-ab.jpg
const ORIGEN_API = API_URL.replace(/\/api\/?$/, '');

export const urlArchivo = (ruta: string): string => `${ORIGEN_API}${ruta}`;
