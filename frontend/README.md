# Frontend React (TypeScript) — pantallas vacías

Esqueleto de la aplicación React (Vite + React Router + Axios). **Todas las pantallas existen como ruta pero están vacías**: falta programar su lógica, conectarlas a la API y diseñarlas. El sitio actual (Handlebars + LESS, en la raíz) **no** se ha pasado a React todavía.

```bash
npm install        # desde la raíz instala también esta carpeta
npm run dev        # solo el front -> http://localhost:5174
npm start          # (raíz) sitio :5173 + API :3000 + app React :5174
```

- `src/paginas/` — una pantalla por archivo (`publicas/`, `cuenta/`, `admin/`). Cada una solo muestra su título; hay que reemplazar el contenido.
- `src/api/cliente.ts` — instancia de Axios (`VITE_API_URL`, por defecto `http://localhost:3000/api`).
- `src/componentes/` — `Layout` provisional con enlaces a todas las pantallas y `PaginaVacia`.
- Usa `HashRouter` (`/#/servicios`), que funciona en GitHub Pages sin configuración. En desarrollo hay que agregar `http://localhost:5174` a `CORS_ORIGINS` de `backend/.env`.
