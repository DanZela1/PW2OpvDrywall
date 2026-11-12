# API de Órdenes: CRUD transaccional

Proyecto independiente: Orden (cabecera) + DetalleOrden (productos) con **transacciones manejadas de Sequelize**
(`db.transaction(async (t) => ...)`): o se guarda TODO, o NO se guarda NADA (COMMIT / ROLLBACK automáticos).

Stack: Node.js + TypeScript (ESM) + Express 4 + Sequelize + MySQL (mysql2) + express-validator + Swagger.

## Puesta en marcha

```bash
cd transac_crud
npm install
cp .env.example .env      # Windows: copy .env.example .env  (edita DB_USER y DB_PASSWORD)
npm run dev               # http://localhost:3000  (la base y las tablas se crean solas)
```

- Swagger: http://localhost:3000/api-docs
- Producción: `npm run build` y luego `npm start`
- Revisar tipos: `npm run typecheck`

## Estructura

```
transac_crud/
├── package.json  tsconfig.json  .env.example  .gitignore  README.md
└── src/
    ├── server.ts                      (arranque: crea la BD, db.sync() y listen)
    ├── app.ts                         (Express, Swagger y rutas)
    ├── configuracion/  db.ts  swagger.ts
    ├── modelos/        modeloOrden.ts  modeloDetalleOrden.ts  index.ts (asociación 1:N, alias "detalles")
    ├── controladores/  controladorOrdenes.ts   (las transacciones)
    ├── rutas/          rutasOrdenes.ts         (validaciones + Swagger)
    └── tipos/          ordenes.ts              (interfaces del body y query)
```

## Endpoints (`/api/transac-crud`)

| Método | Ruta | Descripción | Códigos |
|---|---|---|---|
| GET | `/` | Lista órdenes con detalles | 200, 500 |
| GET | `/buscarid?id=1` | Una orden con detalles | 200, 400, 404, 500 |
| POST | `/guardar` | Crea orden + detalles (transacción) | 201, 400, 409, 500 |
| PUT | `/actualizar?id=1` | Actualiza cabecera y reemplaza detalles (transacción) | 200, 400, 404, 500 |
| DELETE | `/eliminar?id=1` | Elimina detalles y cabecera (transacción) | 200, 400, 404, 500 |

## Probar el ROLLBACK

Envía `"simularError": true` en el body de `/guardar` o `/actualizar`. La petición responde 500 y, al consultar
`GET /api/transac-crud`, comprobarás que no quedó nada guardado (en `/actualizar` la orden conserva sus detalles anteriores).

```bash
curl -X POST http://localhost:3000/api/transac-crud/guardar -H "Content-Type: application/json" -d '{
  "numeroOrden": "ORD-001", "clienteNombre": "Maria Perez", "observaciones": "Entregar en biblioteca",
  "detalles": [
    { "producto": "Resma de papel carta", "cantidad": 10, "precioUnitario": 150.50 },
    { "producto": "Caja de lapiceros azules", "cantidad": 5, "precioUnitario": 80 }
  ],
  "simularError": false
}'
```
