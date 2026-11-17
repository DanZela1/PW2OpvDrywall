import axios from 'axios';

// Cliente de Axios listo para usar en las pantallas. Dirección de la API: VITE_API_URL (frontend/.env).
// Pendiente: enviar el token JWT en cada petición cuando se programe el login.
export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
export const api = axios.create({ baseURL: API_URL });
