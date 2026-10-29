# Guía de trabajo en equipo: ClickUp + GitHub

Objetivo: que cada integrante aporte con **sus propios commits y Pull Requests**, vinculados a tareas de ClickUp.
Cada quien sube su parte desde su cuenta y debe entenderla lo suficiente para explicarla en la revisión.

## 1. Equipo y responsabilidades

| Integrante | Rol | Responsabilidad en el Sprint de backend |
|---|---|---|
| Juan Rivera | Product Owner | Validar criterios de aceptación (PB-01, PB-02, PB-07) |
| Fabricio Zelaya | Scrum Master | Tablero ClickUp, protección de `main`, revisión de Pull Requests |
| Melissa Ramírez | Desarrollo | Base del proyecto: config, MySQL/Sequelize, utilidades, middleware de errores/validación, modelo Usuario y relaciones |
| Saúl Doblado | Desarrollo | Middlewares de seguridad, Auth (PB-06) y CRUD de Usuarios |
| Stefanny Flores | Desarrollo | Cotizaciones (PB-01, PB-02) y "mis cotizaciones" |
| Freed Bonilla | Desarrollo | Servicios (PB-03/04) y Contacto |
| Gustavo Palma | Desarrollo | Postulaciones (PB-09) y conexión del formulario del sitio con la API |
| Kenneth Matute | Desarrollo | Proyectos (PB-07), seed y README |

Las tareas detalladas (30, con estimaciones de 9 a 14 horas por desarrollador) están en `docs/clickup_tareas.csv`.
Los roles de Gustavo y Saúl no figuran en el informe Scrum; aquí se asumen como desarrollo. Ajustar si es otro el caso.

## 2. ClickUp (Fabricio)

1. Crear una **List** llamada `Sprint 2 - Backend` con los estados: `To Do` → `In Progress` → `Review` → `Done`.
2. Invitar a los 8 integrantes al espacio de ClickUp.
3. Importar `docs/clickup_tareas.csv` (Importar → CSV) y mapear las columnas:
   `Task Name`, `Task Content` (descripción), `Status`, `Assignee`, `Priority`, `Time Estimate`, `Tags`.
   Si ClickUp no reconoce a los asignados, asignar a mano.
4. Todas las tareas empiezan en `To Do`. **Cada persona mueve sus tareas** conforme avanza:
   `In Progress` al empezar → `Review` al abrir el Pull Request → `Done` cuando se hace merge.
5. Mantener actualizadas las estimaciones y registrar el tiempo real.
6. Conectar ClickUp con GitHub (Settings → Integrations → GitHub) para que los PR aparezcan dentro de cada tarea.

## 3. Git: ramas, commits y Pull Requests

**Nunca hacer commit directo a `main`.** Cada tarea = una rama = un Pull Request.

Ramas de módulo creadas al inicio (una por desarrollador):

| Rama | Responsable |
|---|---|
| `Melissa` | Melissa |
| `Saul` | Saúl |
| `Stefanny` | Stefanny |
| `Freed-Roque-Bonilla` | Freed |
| `Gustavo` | Gustavo |
| `Matute` | Kenneth |

Las ramas ya existen en el repositorio con el nombre de cada integrante; el ID de ClickUp va en cada commit y en el PR.
Si una persona tiene varias tareas, puede abrir varias ramas/PR a partir de la suya (mejor commits pequeños y varios PR).

```powershell
git checkout main
git pull
git checkout Stefanny          # tu rama (ejemplo): Melissa, Saul, Stefanny, Freed-Roque-Bonilla, Gustavo, Matute, Fabricio o Juan
# ... trabajar ...
git add backend/src/controllers/cotizacion.controller.ts
git commit -m "feat(cotizaciones): agrega POST /api/cotizaciones (CU-86abc123)"
git push -u origin Stefanny
```
Luego abrir el Pull Request en GitHub (la plantilla se llena sola) y mover la tarea a `Review`.

**Formato de commit:** `tipo(modulo): qué hace (CU-id)`, con commits pequeños y descriptivos.
Tipos: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`.

- `feat(auth): agrega login con JWT y bcrypt (CU-86abc124)`
- `test(postman): agrega pruebas de permisos 401/403 de cotizaciones (CU-86abc130)`
- `fix(validaciones): corrige regex de teléfono (CU-86abc131)`

**Revisión:** otro integrante (y Fabricio) revisa cada PR antes del merge. El merge lo hace quien abrió el PR, tras la aprobación.
Después de cada merge, todos hacen `git pull` en `main` y actualizan su rama (`git merge main`).

## 4. Orden de integración (importante)

Los módulos dependen de una base común. Cada PR debe dejar el servidor arrancando (`npm run dev`):

1. **PR 1 (Melissa):** config, utilidades, middleware de errores/validación, modelo Usuario → merge a `main`.
2. **PR 2 (Saúl):** middlewares de seguridad, Auth y Usuarios → merge a `main`.
3. **PR 3 a 6 en paralelo** (Stefanny, Freed, Gustavo, Kenneth): cada uno agrega los archivos de su módulo.
4. Cada módulo agrega **sus propias líneas** en los archivos compartidos `models/index.ts` y `routes/index.ts`
   (por eso esos dos archivos se tocan con cuidado y se hace `git pull` antes).
5. Al final, Kenneth integra el README y se ejecuta la colección completa de Postman.

Archivos de cada módulo (para no pisarse):

| Módulo | Responsable | Archivos |
|---|---|---|
| Base | Melissa | `config/database.ts`, `utils/*`, `middlewares/errorHandler.ts`, `middlewares/validar.ts`, `validators/comunes.js`, `models/Usuario.ts`, `models/index.ts`, `app.js`, `server.js`, `package.json`, `.env.example` |
| Auth y Usuarios | Saúl | `middlewares/auth.ts`, `validators/auth.validator.ts`, `controllers/auth.controller.ts`, `routes/auth.routes.ts`, `validators/usuario.validator.ts`, `controllers/usuario.controller.ts`, `routes/usuarios.routes.ts` |
| Cotizaciones | Stefanny | `models/Cotizacion.ts`, `validators/cotizacion.validator.ts`, `controllers/cotizacion.controller.ts`, `routes/cotizaciones.routes.ts` |
| Servicios y Contacto | Freed | `models/Servicio.ts`, `models/Contacto.ts` y sus `validators/`, `controllers/`, `routes/` |
| Postulaciones y formulario | Gustavo | `models/Postulacion.ts`, `validators/postulacion.validator.ts`, `controllers/postulacion.controller.ts`, `routes/postulaciones.routes.ts`, `html/formRegistro.html`, `javascript/javascript.js`, `styles/_registro.less` |
| Proyectos, seed y docs | Kenneth | `models/Proyecto.ts`, `validators/proyecto.validator.ts`, `controllers/proyecto.controller.ts`, `routes/proyectos.routes.ts`, `seed.ts`, `backend/README.md` |

Si dos personas modifican el mismo archivo, resolver el conflicto en VS Code (*Accept Current / Incoming / Both*) y probar que el servidor arranca.

## 5. Privacidad

El repositorio es **público** (necesario para GitHub Pages gratis). No subir números de identidad, contraseñas,
`.env` ni datos personales de los integrantes; usar solo nombres.

## 6. Checklist para la rúbrica

- [ ] Tablero ClickUp con todas las tareas, asignadas a cada integrante, con estados y estimaciones al día
- [ ] Cada integrante tiene commits propios en GitHub (ver *Insights → Contributors*)
- [ ] Hay ramas por tarea y Pull Requests; ningún commit directo a `main`
- [ ] El título del PR y los commits mencionan el ID de ClickUp (`CU-...`)
- [ ] `npm run dev` arranca, conecta a MySQL y morgan muestra las peticiones
- [ ] Colección de Postman exportada en `backend/postman/` y capturas de la ejecución

## Orden de integración de los Pull Requests (backend por etapas)

PR1 (Melissa, base) → PR2 (Saúl, auth/usuarios) → PR3, PR4 y PR5 (Stefanny, Freed, Gustavo; en paralelo) → PR6 (Kenneth; requiere PR3).

- Los modelos, rutas y seeds se cargan automáticamente (`models/index.ts`, `routes/index.ts`, `seed.ts`), por eso cada PR solo agrega archivos nuevos y no hay conflictos.
- PR6 reemplaza `cotizacion.controller.ts` (agrega el `include` de Proyecto): hacer merge después de PR3.
- El seed del admin lo hace Melissa (PR1); el de servicios, Freed (PR4).
- Cada merge deja el servidor arrancando (`npm run dev`).

## Nota: el backend está en TypeScript

Todo el código de `backend/src` está en TypeScript (`.ts`). `npm run dev` usa nodemon con ts-node, `npm run build` compila a `dist/` y `npm start` corre lo compilado. Antes de abrir un PR, además de probar con Postman, ejecutar `npm run typecheck` para confirmar que no hay errores de tipos.
