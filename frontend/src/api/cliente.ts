
import axios from 'axios';

export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
});

// Agregar automáticamente el token JWT a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      sessionStorage.getItem('token') &&
      !error.config?.url?.includes('/auth/login')
    ) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('usuario');

      window.location.hash = '#/login';
    }

    return Promise.reject(error);
  }
);
