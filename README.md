# OPV Drywall

Sitio web y API para OPV Drywall. El repositorio contiene el sitio público actual en la raíz, una API REST en `backend/` y una aplicación React en `frontend/` que se está desarrollando.

## Decisión sobre el sitio actual

Se conservará el sitio estático de la raíz como versión pública mientras se termina la migración a React. El flujo de GitHub Pages en `.github/workflows/deploy.yml` compila actualmente el sitio raíz. La aplicación React no reemplazará el sitio publicado hasta que estén listas sus pantallas, la integración con la API, la sesión y las pruebas de aceptación. Así se evita publicar rutas vacías o perder funciones que ya utiliza el sitio actual.

## Requisitos

- Node.js 22 o superior.
- MySQL 8 o MariaDB para la API.

## Desarrollo local

Desde la raíz:

```bash
npm install
npm start
```

El comando inicia el sitio raíz en `http://localhost:5173`, la API en `http://localhost:3000` y React en `http://localhost:5174`. En `backend/.env` configura la base de datos, `JWT_SECRET` y, para correo, las credenciales SMTP. En `frontend/.env` configura `VITE_API_URL` para apuntar a la API.

Para iniciar cada aplicación por separado, consulta [`docs/EJECUTAR.md`](docs/EJECUTAR.md), el [README del backend](backend/README.md) y el [README de React](frontend/README.md).

## Estructura

- `html/`, `partials/`, `styles/`, `javascript/`: sitio público actual (Handlebars, LESS y Vite).
- `backend/`: API REST con Express, TypeScript, Sequelize y MySQL.
- `frontend/`: aplicación React con TypeScript y Vite.
- `docs/`: carta de aceptación y documentación del equipo.

## Verificaciones

- Sitio raíz: `npm run build`
- Backend: `npm run typecheck --prefix backend` y `npm run docs:check --prefix backend`
- React: `npm run build --prefix frontend`

No publiques archivos `.env` ni contraseñas reales en el repositorio.
