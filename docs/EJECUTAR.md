# Cómo correr el proyecto (un solo comando desde la raíz)

Requisitos: Node 22 y MySQL encendido en XAMPP.

```
git clone https://github.com/DanZela1/PW2OpvDrywall.git
cd PW2OpvDrywall
npm install      # instala TODO: sitio, backend y frontend (React), y crea los .env que falten
npm start        # levanta las tres partes a la vez
```

Revisa `backend/.env` (`DB_USER` y `DB_PASSWORD`; en XAMPP normalmente root y vacío).
Primera vez, para el admin, los servicios, las categorías, las preguntas y los testimonios: `npm run seed --prefix backend`

Los correos (bienvenida, recuperar contraseña, cotizaciones) necesitan `SMTP_*` en `backend/.env`; sin eso la API funciona igual pero no envía correos. Más detalles en `backend/README.md`.

## Un puerto para cada cosa

| Parte | Puerto | Dirección |
|---|---|---|
| Sitio web (Vite) | 5173 | http://localhost:5173 |
| API principal (backend) | 3000 | http://localhost:3000/api-docs |
| App React (`frontend/`, pantallas vacías) | 5174 | http://localhost:5174 |

Si un puerto está ocupado, el programa lo dice y se detiene (no se cambia solo). Cierra el otro programa y vuelve a correr `npm start`.

## Comandos (desde la raíz)

| Comando | Qué hace |
|---|---|
| `npm start` | Sitio + API principal + API de órdenes |
| `npm run dev:api` | Solo sitio + API principal |
| `npm run setup` | Reinstala todo y crea los `.env` que falten |
| `npm run typecheck:all` | Revisa los tipos de las tres partes |
| `npm run build:all` | Compila las tres partes |

Después de un `git pull` que cambie algún `package.json`, corre `npm install` otra vez en la raíz.
