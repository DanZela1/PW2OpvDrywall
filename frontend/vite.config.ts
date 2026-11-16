import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Puerto 5174 para no chocar con el sitio estático (5173). La API debe permitir este origen en CORS_ORIGINS.
// base './' deja la app lista para publicarse en cualquier carpeta (usa HashRouter, no necesita configuración del servidor).
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5174, strictPort: true },
});
