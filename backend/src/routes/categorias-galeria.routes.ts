import { Router } from 'express';
import c from '../controllers/categoria.controller';
import * as v from '../validators/categoria.validator';
import validar from '../middlewares/validar';
import { auth, authOpcional, soloAdmin } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categorías de galería
 *   description: Categorías para agrupar las fotos de la galería (lectura pública, gestión solo admin)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CategoriaGaleria:
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
 *           nullable: true
 *           example: Trabajos en viviendas
 *         activa:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CategoriaGaleriaEntrada:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           maxLength: 60
 *           example: Estructura Residencial
 *         descripcion:
 *           type: string
 *           maxLength: 255
 *           example: Trabajos en viviendas
 *         activa:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /categorias-galeria:
 *   get:
 *     summary: Listar categorías de galería (público ve solo las activas)
 *     tags: [Categorías de galería]
 *     security:
 *       - {}
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
 *           enum: [id, nombre]
 *       - $ref: '#/components/parameters/Dir'
 *       - in: query
 *         name: activa
 *         schema:
 *           type: boolean
 *         description: Solo tiene efecto para el admin
 *     responses:
 *       200:
 *         description: Lista de categorías
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
 *                     $ref: '#/components/schemas/CategoriaGaleria'
 *       400:
 *         description: Parámetros inválidos
 */
router.get('/', authOpcional, v.listar, validar, c.listar);

/**
 * @swagger
 * /categorias-galeria/{id}:
 *   get:
 *     summary: Obtener una categoría por ID (público solo si está activa)
 *     tags: [Categorías de galería]
 *     security:
 *       - {}
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriaGaleria'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Categoría no encontrada
 */
router.get('/:id', authOpcional, v.id, validar, c.obtener);

/**
 * @swagger
 * /categorias-galeria:
 *   post:
 *     summary: Crear una categoría (solo admin)
 *     tags: [Categorías de galería]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/CategoriaGaleriaEntrada'
 *               - type: object
 *                 required: [nombre]
 *     responses:
 *       201:
 *         description: Categoría creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriaGaleria'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente, inválido o vencido
 *       403:
 *         description: No tiene permisos de administrador
 *       409:
 *         description: Ya existe una categoría con ese nombre
 */
router.post('/', auth, soloAdmin, v.crear, validar, c.crear);

/**
 * @swagger
 * /categorias-galeria/{id}:
 *   put:
 *     summary: Actualizar una categoría (solo admin, al menos un campo)
 *     tags: [Categorías de galería]
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
 *             $ref: '#/components/schemas/CategoriaGaleriaEntrada'
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriaGaleria'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente, inválido o vencido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Categoría no encontrada
 *       409:
 *         description: Ya existe una categoría con ese nombre
 */
router.put('/:id', auth, soloAdmin, v.actualizar, validar, c.actualizar);

/**
 * @swagger
 * /categorias-galeria/{id}:
 *   delete:
 *     summary: Eliminar una categoría (solo admin)
 *     tags: [Categorías de galería]
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
 *         description: Categoría eliminada correctamente
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token ausente, inválido o vencido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Categoría no encontrada
 */
router.delete('/:id', auth, soloAdmin, v.id, validar, c.eliminar);

export default router;
