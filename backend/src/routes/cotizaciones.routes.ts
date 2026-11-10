import { Router } from 'express';
import c from '../controllers/cotizacion.controller';
import * as v from '../validators/cotizacion.validator';
import validar from '../middlewares/validar';
import { auth, authOpcional, soloAdmin } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cotizaciones
 *   description: Solicitudes de cotización (envío público, gestión solo admin)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Cotizacion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: Carlos López
 *         correo:
 *           type: string
 *           format: email
 *           example: carlos@mail.com
 *         telefono:
 *           type: string
 *           maxLength: 10
 *           example: "98765432"
 *         tipoServicio:
 *           type: string
 *           example: Cielo falso
 *         ubicacion:
 *           type: string
 *           maxLength: 150
 *           example: Tegucigalpa, Col. Kennedy
 *         descripcion:
 *           type: string
 *           maxLength: 1000
 *           example: Necesito cielo falso en una sala de 20 m2.
 *         estado:
 *           type: string
 *           enum: [pendiente, enviada, aceptada]
 *           example: pendiente
 *         usuarioId:
 *           type: integer
 *           nullable: true
 *           description: Usuario que la envió estando logueado (null si fue anónima)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CotizacionEntrada:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           example: Carlos López
 *         correo:
 *           type: string
 *           format: email
 *           example: carlos@mail.com
 *         telefono:
 *           type: string
 *           maxLength: 10
 *           example: "98765432"
 *         tipoServicio:
 *           type: string
 *           example: Cielo falso
 *         ubicacion:
 *           type: string
 *           maxLength: 150
 *           example: Tegucigalpa, Col. Kennedy
 *         descripcion:
 *           type: string
 *           maxLength: 1000
 *           example: Necesito cielo falso en una sala de 20 m2.
 *         estado:
 *           type: string
 *           enum: [pendiente, enviada, aceptada]
 */

/**
 * @swagger
 * /cotizaciones:
 *   post:
 *     summary: Solicitar una cotización (público; si hay token se asocia al usuario)
 *     tags: [Cotizaciones]
 *     security:
 *       - {}
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, correo, telefono, tipoServicio, ubicacion, descripcion]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Carlos López
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: carlos@mail.com
 *               telefono:
 *                 type: string
 *                 maxLength: 10
 *                 example: "98765432"
 *               tipoServicio:
 *                 type: string
 *                 example: Cielo falso
 *               ubicacion:
 *                 type: string
 *                 maxLength: 150
 *                 example: Tegucigalpa, Col. Kennedy
 *               descripcion:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Necesito cielo falso en una sala de 20 m2.
 *     responses:
 *       201:
 *         description: Cotización registrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cotizacion'
 *       400:
 *         description: Datos inválidos
 */
router.post('/', authOpcional, v.crear, validar, c.crear); // público (PB-01)

/**
 * @swagger
 * /cotizaciones/mias:
 *   get:
 *     summary: Listar las cotizaciones del cliente autenticado
 *     tags: [Cotizaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cotizaciones del usuario logueado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cotizacion'
 *       401:
 *         description: Token ausente o inválido
 */
router.get('/mias', auth, c.listarMias); // cliente logueado

/**
 * @swagger
 * /cotizaciones:
 *   get:
 *     summary: Listar todas las cotizaciones (solo admin)
 *     tags: [Cotizaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, enviada, aceptada]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de cotizaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 pagina:
 *                   type: integer
 *                 limite:
 *                   type: integer
 *                 datos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Cotizacion'
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 */
router.get('/', auth, soloAdmin, v.listar, validar, c.listar); // admin (PB-02)

/**
 * @swagger
 * /cotizaciones/{id}:
 *   get:
 *     summary: Obtener una cotización por ID (solo admin)
 *     tags: [Cotizaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cotización encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cotizacion'
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Cotización no encontrada
 */
router.get('/:id', auth, soloAdmin, v.id, validar, c.obtener);

/**
 * @swagger
 * /cotizaciones/{id}:
 *   put:
 *     summary: Actualizar una cotización (solo admin, al menos un campo)
 *     tags: [Cotizaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CotizacionEntrada'
 *     responses:
 *       200:
 *         description: Cotización actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cotizacion'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Cotización no encontrada
 */
router.put('/:id', auth, soloAdmin, v.actualizar, validar, c.actualizar);

/**
 * @swagger
 * /cotizaciones/{id}/estado:
 *   patch:
 *     summary: Cambiar el estado de una cotización (solo admin)
 *     tags: [Cotizaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, enviada, aceptada]
 *                 example: enviada
 *     responses:
 *       200:
 *         description: Estado actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cotizacion'
 *       400:
 *         description: Estado inválido
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Cotización no encontrada
 */
router.patch('/:id/estado', auth, soloAdmin, v.estado, validar, c.cambiarEstado);

/**
 * @swagger
 * /cotizaciones/{id}:
 *   delete:
 *     summary: Eliminar una cotización (solo admin)
 *     tags: [Cotizaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cotización eliminada correctamente
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Cotización no encontrada
 */
router.delete('/:id', auth, soloAdmin, v.id, validar, c.eliminar);

export default router;