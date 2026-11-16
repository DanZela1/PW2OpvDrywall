# Cómo correr el proyecto (un solo comando desde la raíz)

Requisitos: Node 22 y MySQL encendido en XAMPP.

```
git clone https://github.com/DanZela1/PW2OpvDrywall.git
cd PW2OpvDrywall
npm install      # instala TODO: sitio, backend y transac_crud, y crea los .env que falten
npm start        # levanta las tres partes a la vez
```

Revisa `backend/.env` y `transac_crud/.env` (`DB_USER` y `DB_PASSWORD`; en XAMPP normalmente root y vacío).
Primera vez, para el admin y los servicios: `npm run seed --prefix backend`

## Un puerto para cada cosa

| Parte | Puerto | Dirección |
|---|---|---|
| Sitio web (Vite) | 5173 | http://localhost:5173 |
| API principal (backend) | 3000 | http://localhost:3000/api-docs |
| API de órdenes (transac_crud) | 3001 | http://localhost:3001/api-docs |

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
