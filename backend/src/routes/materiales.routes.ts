import { Router } from 'express';
import c from '../controllers/material.controller';
import * as v from '../validators/material.validator';
import validar from '../middlewares/validar';
import { auth, soloAdmin } from '../middlewares/auth';

const router = Router();
router.use(auth, soloAdmin); // todo este módulo es solo para administradores

/**
 * @swagger
 * tags:
 *   name: Materiales
 *   description: Catálogo de materiales con precio (solo admin); se usa para armar el detalle de las cotizaciones
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Material:
 *       type: object
 *       properties:
 *        id:
 *          type: integer
 *        nombre:
 *          type: string
 *          example: Plancha de yeso 1/2"
 *        unidad:
 *          type: string
 *          example: plancha
 *        precioUnitario:
 *          type: number
 *          example: 185.5
 *        activo:
 *          type: boolean
 *          default: true
 *        createdAt:
 *          type: string
 *          format: date-time
 *     MaterialEntrada:
 *       type: object
 *       required: [nombre, unidad, precioUnitario]
 *       properties:
 *        nombre:
 *          type: string
 *          example: Plancha de yeso 1/2"
 *        unidad:
 *          type: string
 *          example: plancha
 *        precioUnitario:
 *          type: number
 *          example: 185.5
 *        activo:
 *          type: boolean
 *          default: true
 */

/**
 * @swagger
 * /materiales:
 *   get:
 *     summary: Listar materiales (solo admin)
 *     tags: [Materiales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Pagina'
 *       - $ref: '#/components/parameters/Limite'
 *       - $ref: '#/components/parameters/Busqueda'
 *       - $ref: '#/components/parameters/Desde'
 *       - $ref: '#/components/parameters/Hasta'
 *       - in: query
 *         name: ordenarPor
 *         schema:
 *           type: string
 *           enum: [id, createdAt, nombre, precioUnitario]
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *       - $ref: '#/components/parameters/Dir'
 *     responses:
 *       200:
 *         description: Lista paginada
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
 *                     $ref: '#/components/schemas/Material'
 *       403:
 *         description: No tiene permisos de administrador
 */
router.get('/', v.listar, validar, c.listar);

/**
 * @swagger
 * /materiales/{id}:
 *   get:
 *     summary: Obtener por ID (solo admin)
 *     tags: [Materiales]
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
 *         description: Encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Material'
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: No encontrado
 */
router.get('/:id', v.id, validar, c.obtener);

/**
 * @swagger
 * /materiales:
 *   post:
 *     summary: Crear (solo admin)
 *     tags: [Materiales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MaterialEntrada'
 *     responses:
 *       201:
 *         description: Creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Material'
 *       403:
 *         description: No tiene permisos de administrador
 *       409:
 *         description: Ya existe un registro con esos datos
 */
router.post('/', v.crear, validar, c.crear);

/**
 * @swagger
 * /materiales/{id}:
 *   put:
 *     summary: Actualizar (solo admin, al menos un campo)
 *     tags: [Materiales]
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
 *             $ref: '#/components/schemas/MaterialEntrada'
 *     responses:
 *       200:
 *         description: Actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Material'
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: No encontrado
 *       409:
 *         description: Ya existe un registro con esos datos
 */
router.put('/:id', v.actualizar, validar, c.actualizar);

/**
 * @swagger
 * /materiales/{id}:
 *   delete:
 *     summary: Eliminar (solo admin)
 *     tags: [Materiales]
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
 *         description: Eliminado
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: No encontrado
 */
router.delete('/:id', v.id, validar, c.eliminar);

export default router;
