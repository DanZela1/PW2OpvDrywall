import { Router } from 'express';
import c from '../controllers/cliente.controller';
import * as v from '../validators/cliente.validator';
import validar from '../middlewares/validar';
import { auth, soloAdmin } from '../middlewares/auth';

const router = Router();
router.use(auth, soloAdmin); // todo este módulo es solo para administradores

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Clientes de la empresa (solo admin). Se crean solos al cotizar, y también se pueden gestionar a mano
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Cliente:
 *       type: object
 *       properties:
 *        id:
 *          type: integer
 *        nombre:
 *          type: string
 *          example: Carlos Mejía
 *        correo:
 *          type: string
 *          format: email
 *          example: carlos@mail.com
 *        telefono:
 *          type: string
 *          example: "99887766"
 *        direccion:
 *          type: string
 *          nullable: true
 *        notas:
 *          type: string
 *          nullable: true
 *        createdAt:
 *          type: string
 *          format: date-time
 *        cotizaciones:
 *          type: array
 *          items:
 *            type: object
 *          description: Cotizaciones del cliente (resumen)
 *     ClienteEntrada:
 *       type: object
 *       required: [nombre, correo, telefono]
 *       properties:
 *        nombre:
 *          type: string
 *          example: Carlos Mejía
 *        correo:
 *          type: string
 *          format: email
 *          example: carlos@mail.com
 *        telefono:
 *          type: string
 *          example: "99887766"
 *        direccion:
 *          type: string
 *          nullable: true
 *        notas:
 *          type: string
 *          nullable: true
 */

/**
 * @swagger
 * /clientes:
 *   get:
 *     summary: Listar clientes (solo admin)
 *     tags: [Clientes]
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
 *           enum: [id, createdAt, nombre, correo]
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
 *                     $ref: '#/components/schemas/Cliente'
 *       403:
 *         description: No tiene permisos de administrador
 */
router.get('/', v.listar, validar, c.listar);

/**
 * @swagger
 * /clientes/{id}:
 *   get:
 *     summary: Obtener por ID (solo admin)
 *     tags: [Clientes]
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
 *               $ref: '#/components/schemas/Cliente'
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: No encontrado
 */
router.get('/:id', v.id, validar, c.obtener);

/**
 * @swagger
 * /clientes:
 *   post:
 *     summary: Crear (solo admin)
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClienteEntrada'
 *     responses:
 *       201:
 *         description: Creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       403:
 *         description: No tiene permisos de administrador
 *       409:
 *         description: Ya existe un registro con esos datos
 */
router.post('/', v.crear, validar, c.crear);

/**
 * @swagger
 * /clientes/{id}:
 *   put:
 *     summary: Actualizar (solo admin, al menos un campo)
 *     tags: [Clientes]
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
 *             $ref: '#/components/schemas/ClienteEntrada'
 *     responses:
 *       200:
 *         description: Actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
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
 * /clientes/{id}:
 *   delete:
 *     summary: Eliminar (solo admin)
 *     tags: [Clientes]
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
