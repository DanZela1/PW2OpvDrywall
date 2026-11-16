import { Router } from 'express';
import * as c from '../controllers/reportes.controller';
import * as v from '../validators/reporte.validator';
import validar from '../middlewares/validar';
import { auth, soloAdmin } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reportes
 *   description: Estadísticas para el panel de administración (solo admin)
 */

/**
 * @swagger
 * /reportes/resumen:
 *   get:
 *     summary: Resumen general del sistema (conteos por estado)
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conteos de usuarios, cotizaciones, postulaciones, contactos, proyectos y testimonios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 generadoEn:
 *                   type: string
 *                   format: date-time
 *                 usuarios:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     porRol:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                       example: { admin: 1, cliente: 12 }
 *                 cotizaciones:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     ultimos30Dias:
 *                       type: integer
 *                     porEstado:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                       example: { pendiente: 4, en_revision: 2, enviada: 3, aceptada: 1, rechazada: 0 }
 *                 postulaciones:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     porEstado:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                 contactos:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     sinLeer:
 *                       type: integer
 *                 proyectos:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     porEstado:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                 testimonios:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     porEstado:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *       401:
 *         description: Token ausente, inválido o vencido
 *       403:
 *         description: No tiene permisos de administrador
 */
router.get('/resumen', auth, soloAdmin, c.resumen);

/**
 * @swagger
 * /reportes/cotizaciones-por-mes:
 *   get:
 *     summary: Cotizaciones recibidas por mes (los meses sin datos salen con 0)
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: meses
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 24
 *           default: 6
 *         description: Cuántos meses hacia atrás (incluye el mes actual)
 *     responses:
 *       200:
 *         description: Serie mensual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meses:
 *                   type: integer
 *                   example: 6
 *                 datos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       mes:
 *                         type: string
 *                         example: 2026-11
 *                       total:
 *                         type: integer
 *                         example: 7
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: Token ausente, inválido o vencido
 *       403:
 *         description: No tiene permisos de administrador
 */
router.get('/cotizaciones-por-mes', auth, soloAdmin, v.porMes, validar, c.cotizacionesPorMes);

/**
 * @swagger
 * /reportes/cotizaciones-por-servicio:
 *   get:
 *     summary: Servicios más solicitados en las cotizaciones
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Servicios ordenados de mayor a menor cantidad de cotizaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   tipoServicio:
 *                     type: string
 *                     example: Paneles de Yeso
 *                   total:
 *                     type: integer
 *                     example: 9
 *       401:
 *         description: Token ausente, inválido o vencido
 *       403:
 *         description: No tiene permisos de administrador
 */
router.get('/cotizaciones-por-servicio', auth, soloAdmin, c.cotizacionesPorServicio);

export default router;
