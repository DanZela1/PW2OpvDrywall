# Publicar la API

Pasos para dejar la API (`backend/`) en un hosting y conectarla con el sitio y con la app React.
Hoy la API solo corre en la computadora de cada integrante; el sitio de GitHub Pages no puede usarla hasta completar esta guía.

> **Antes de empezar:** el backend de cotizaciones, proyectos y correos debe estar estable en `main`, y el administrador
> debe tener una contraseña propia (no `Admin123!`).

## 1. Qué debe ofrecer el hosting

| Necesidad | Por qué |
|---|---|
| Node.js 20.19 o superior | Es la versión del proyecto (el equipo usa la 22) |
| Base de datos MySQL o MariaDB | La API usa Sequelize con el dialecto `mysql`; no funciona con PostgreSQL |
| Disco persistente | Las fotos de galería, las imágenes de servicios y los CV se guardan en disco. En un disco temporal se pierden en cada despliegue |
| HTTPS | GitHub Pages usa HTTPS y el navegador bloquea llamadas a una API en HTTP |

## 2. Configuración del servicio

| Ajuste | Valor |
|---|---|
| Carpeta raíz | `backend` |
| Instalación y compilación | `npm install --include=dev && npm run build` |
| Arranque | `npm start` |
| Comprobación de salud | `GET /api/salud` |

`--include=dev` hace falta porque `npm run build` usa TypeScript, que es una dependencia de desarrollo.

## 3. Variables de entorno en el hosting

Se escriben en el panel del hosting. **Nunca** se sube un archivo `.env` al repositorio.

| Variable | Valor en producción | Notas |
|---|---|---|
| `PORT` | El que asigne el hosting | Muchos hostings la definen solos; en ese caso no se toca |
| `JWT_SECRET` | Una frase larga y nueva | No reutilizar la de desarrollo |
| `CORS_ORIGINS` | `https://danzela1.github.io` | Sin `/` al final y sin la ruta `/PW2OpvDrywall`: el origen es solo protocolo y dominio. Si la app React se publica en otro dominio, se agrega separado por coma |
| `FRONTEND_URL` | Dirección pública del front | Se usa en los enlaces de los correos |
| `TRUST_PROXY` | `1` | Para que el límite de peticiones cuente la IP del visitante y no la del proxy del hosting |
| `UPLOADS_DIR` | Ruta del disco persistente, por ejemplo `/data/uploads` | La API crea dentro `imagenes/`, `testimonios/` y `cv/` |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Los que entregue el proveedor de MySQL | `DB_NAME` sigue siendo `opv_drywall` si el proveedor deja elegirlo |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CORREO_REMITENTE`, `CORREO_ADMIN` | Los mismos que ya se probaron en local | `SMTP_PASS` es una contraseña de aplicación de Gmail |

## 4. Primera puesta en marcha

1. Despliega y abre `https://<tu-api>/api/salud`. Debe responder `{"ok":true,"servicio":"OPV Drywall API"}`.
   Las tablas se crean solas al arrancar.
2. Carga los datos iniciales una sola vez, desde la consola del hosting: `npm run seed:prod`.
3. Abre `https://<tu-api>/api-docs`, inicia sesión con `POST /auth/login` y prueba un endpoint protegido.

## 5. Conectar el sitio y la app React

| Dónde | Cambio |
|---|---|
| `javascript/javascript.ts` (sitio de la raíz) | Reemplazar `https://TU-API.onrender.com` por la dirección real de la API, sin `/api` al final |
| App React (`frontend/`) | Compilar con `VITE_API_URL=https://<tu-api>/api`. Esta variable se lee al compilar, no al abrir la página: si cambia, hay que volver a compilar |

Las imágenes subidas se sirven fuera de `/api`: `https://<tu-api>/uploads/imagenes/<archivo>`.
La app React arma esa dirección sola a partir de `VITE_API_URL` (`frontend/src/api/archivos.ts`).

## 6. Comprobación final

| Prueba | Resultado esperado |
|---|---|
| Enviar el formulario de cotización desde GitHub Pages | Se registra la cotización, sin error de CORS en la consola del navegador |
| Subir una foto en `/#/admin/galeria`, volver a desplegar la API y recargar | La foto sigue visible (el disco es persistente) |
| Pedir la recuperación de contraseña | El enlace del correo abre el front publicado, no `localhost` |
| Más de 20 intentos de login seguidos desde una computadora | Solo esa computadora recibe `429`; desde otra red el login sigue funcionando |

## Si algo falla

| Síntoma | Causa probable |
|---|---|
| Error de CORS en el navegador | El origen no está en `CORS_ORIGINS`, tiene `/` al final o incluye la ruta |
| `Falta JWT_SECRET` en los registros del hosting | La variable no se definió en el panel |
| `ECONNREFUSED` o `Access denied` al arrancar | Datos de `DB_*` incorrectos |
| Todos los visitantes reciben `429` a la vez | Falta `TRUST_PROXY=1` |
| Las fotos desaparecen tras un despliegue | `UPLOADS_DIR` no apunta al disco persistente |
