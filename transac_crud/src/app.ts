import express, { Express, NextFunction, Request, Response } from 'express';
import rutasOrdenes from './rutas/rutasOrdenes.js';
import { configurarSwagger } from './configuracion/swagger.js';

const app: Express = express();

// Permite leer el body en formato JSON
app.use(express.json());

// Documentación Swagger en http://localhost:PORT/api-docs
configurarSwagger(app);

// Ruta de comprobación rápida
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, servicio: 'API de Órdenes (CRUD transaccional)', docs: '/api-docs' });
});

// Los 5 endpoints del CRUD transaccional
app.use('/api/transac-crud', rutasOrdenes);

// Ruta inexistente -> 404 en JSON
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Errores no controlados (por ejemplo, JSON mal formado en el body) -> JSON
app.use((error: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  if (error.status === 400) {
    return res.status(400).json({ error: 'JSON inválido en el cuerpo de la petición' });
  }
  console.error('Error no controlado:', error);
  return res.status(500).json({ error: 'Error interno del servidor' });
});

export default app;
