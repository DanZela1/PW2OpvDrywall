import fs from 'fs';
import path from 'path';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Sistema
 *   description: Estado del servicio
 */

/**
 * @swagger
 * /salud:
 *   get:
 *     summary: Comprobar que la API está funcionando
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: La API responde
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 servicio:
 *                   type: string
 *                   example: OPV Drywall API
 */
router.get('/salud', (_req, res) => {
  res.json({ ok: true, servicio: 'OPV Drywall API' });
});

// ".ts" con ts-node (npm run dev) y ".js" compilado (npm start)
const EXT = path.extname(__filename);

// Monta automáticamente cada archivo "<nombre>.routes" en /api/<nombre>
// (ej. cotizaciones.routes -> /api/cotizaciones). Agregar un módulo no obliga a editar este archivo.
fs.readdirSync(__dirname)
  .filter((archivo) => archivo.endsWith(`.routes${EXT}`) && !archivo.endsWith('.d.ts'))
  .forEach((archivo) => {
    const nombre = archivo.replace(`.routes${EXT}`, '');
    router.use(`/${nombre}`, require(path.join(__dirname, archivo)).default);
  });

export default router;
