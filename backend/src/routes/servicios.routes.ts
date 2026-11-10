import { Router } from 'express';
import c from '../controllers/servicio.controller';
import * as v from '../validators/servicio.validator';
import validar from '../middlewares/validar';
import { auth, soloAdmin } from '../middlewares/auth';
import { subirImagen } from '../middlewares/subida';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Servicios
 *   description: Servicios que ofrece OPV Drywall (lectura pública, gestión solo admin)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Servicio:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: Estructura Residencial
 *         descripcion:
 *           type: string
 *           example: Estructuras de drywall para viviendas
 *         categoria:
 *           type: string
 *           example: Construcción
 *         contacto:
 *           type: string
 *           nullable: true
 *           example: ventas@opvdrywall.com
 *         activo:
 *           type: boolean
 *           example: true
 *         usuarioId:
 *           type: integer
 *           nullable: true
 *           description: ID del usuario admin que lo creó
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ServicioEntrada:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           example: Estructura Residencial
 *         descripcion:
 *           type: string
 *           maxLength: 1000
 *           example: Estructuras de drywall para viviendas
 *         categoria:
 *           type: string
 *           maxLength: 60
 *           example: Construcción
 *         contacto:
 *           type: string
 *           maxLength: 120
 *           example: ventas@opvdrywall.com
 *         activo:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /servicios:
 *   get:
 *     summary: Listar servicios (público, con paginación y filtros)
 *     tags: [Servicios]
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
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por servicios activos o inactivos
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *     responses:
 *       200:
 *         description: Lista de servicios
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
 *                     $ref: '#/components/schemas/Servicio'
 *       400:
 *         description: Parámetros inválidos
 */
router.get('/', v.listar, validar, c.listar); // público

/**
 * @swagger
 * /servicios/{id}:
 *   get:
 *     summary: Obtener un servicio por ID (público)
 *     tags: [Servicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Servicio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Servicio'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Servicio no encontrado
 */
router.get('/:id', v.id, validar, c.obtener); // público

/**
 * @swagger
 * /servicios:
 *   post:
 *     summary: Crear un servicio (solo admin)
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ServicioEntrada'
 *               - type: object
 *                 required: [nombre, descripcion, categoria]
 *     responses:
 *       201:
 *         description: Servicio creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Servicio'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       409:
 *         description: Ya existe un servicio con ese nombre
 */
router.post('/', auth, soloAdmin, subirImagen, v.crear, validar, c.crear);

/**
 * @swagger
 * /servicios/{id}:
 *   put:
 *     summary: Actualizar un servicio (solo admin, al menos un campo)
 *     tags: [Servicios]
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
 *             $ref: '#/components/schemas/ServicioEntrada'
 *     responses:
 *       200:
 *         description: Servicio actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Servicio'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Servicio no encontrado
 */
router.put('/:id', auth, soloAdmin, subirImagen, v.actualizar, validar, c.actualizar);

/**
 * @swagger
 * /servicios/{id}:
 *   delete:
 *     summary: Eliminar un servicio (solo admin)
 *     tags: [Servicios]
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
 *         description: Servicio eliminado correctamente
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Servicio no encontrado
 */
router.delete('/:id', auth, soloAdmin, v.id, validar, c.eliminar);

export default router;