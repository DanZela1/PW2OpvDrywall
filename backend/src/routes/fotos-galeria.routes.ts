import { Router } from 'express';
import c from '../controllers/foto-galeria.controller';
import * as v from '../validators/foto-galeria.validator';
import validar from '../middlewares/validar';
import { auth, authOpcional, soloAdmin } from '../middlewares/auth';
import { subirImagen } from '../middlewares/subida';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Fotos de galería
 *   description: Fotos de trabajos realizados, agrupadas por categoría (lectura pública, gestión solo admin)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FotoGaleria:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         titulo:
 *           type: string
 *           example: Cielo falso en sala
 *         descripcion:
 *           type: string
 *           nullable: true
 *           example: Vivienda en Tegucigalpa, 40 m²
 *         imagen:
 *           type: string
 *           description: Ruta pública del archivo; se abre con la dirección de la API delante
 *           example: /uploads/imagenes/1793000000000-ab12cd34ef567890.jpg
 *         activa:
 *           type: boolean
 *           example: true
 *         categoriaId:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         categoria:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             nombre:
 *               type: string
 *               example: Estructura Residencial
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     FotoGaleriaEntrada:
 *       type: object
 *       properties:
 *         titulo:
 *           type: string
 *           maxLength: 100
 *           example: Cielo falso en sala
 *         descripcion:
 *           type: string
 *           maxLength: 255
 *           example: Vivienda en Tegucigalpa, 40 m²
 *         categoriaId:
 *           type: integer
 *           description: ID de una categoría de galería existente
 *           example: 1
 *         activa:
 *           type: boolean
 *           example: true
 *         imagen:
 *           type: string
 *           format: binary
 *           description: Imagen JPG, PNG o WebP (máximo 5 MB)
 */

/**
 * @swagger
 * /fotos-galeria:
 *   get:
 *     summary: Listar fotos de la galería (público ve solo las activas)
 *     tags: [Fotos de galería]
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
 *           enum: [id, createdAt, titulo]
 *       - $ref: '#/components/parameters/Dir'
 *       - in: query
 *         name: categoriaId
 *         schema:
 *           type: integer
 *         description: Solo las fotos de esa categoría
 *       - in: query
 *         name: activa
 *         schema:
 *           type: boolean
 *         description: Solo tiene efecto para el admin
 *     responses:
 *       200:
 *         description: Lista de fotos
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
 *                     $ref: '#/components/schemas/FotoGaleria'
 *       400:
 *         description: Parámetros inválidos
 */
router.get('/', authOpcional, v.listar, validar, c.listar);

/**
 * @swagger
 * /fotos-galeria/{id}:
 *   get:
 *     summary: Obtener una foto por ID (público solo si está activa)
 *     tags: [Fotos de galería]
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
 *         description: Foto encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FotoGaleria'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Foto no encontrada
 */
router.get('/:id', authOpcional, v.id, validar, c.obtener);

/**
 * @swagger
 * /fotos-galeria:
 *   post:
 *     summary: Subir una foto a la galería (solo admin)
 *     tags: [Fotos de galería]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/FotoGaleriaEntrada'
 *               - type: object
 *                 required: [titulo, categoriaId, imagen]
 *     responses:
 *       201:
 *         description: Foto creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FotoGaleria'
 *       400:
 *         description: Datos inválidos, falta la imagen o la categoría no existe
 *       401:
 *         description: Token ausente, inválido o vencido
 *       403:
 *         description: No tiene permisos de administrador
 *       413:
 *         description: La imagen supera el tamaño máximo
 */
router.post('/', auth, soloAdmin, subirImagen, v.crear, validar, c.crear);

/**
 * @swagger
 * /fotos-galeria/{id}:
 *   put:
 *     summary: Actualizar una foto (solo admin, al menos un campo o una imagen nueva)
 *     tags: [Fotos de galería]
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
 *             $ref: '#/components/schemas/FotoGaleriaEntrada'
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/FotoGaleriaEntrada'
 *     responses:
 *       200:
 *         description: Foto actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FotoGaleria'
 *       400:
 *         description: Datos inválidos o la categoría no existe
 *       401:
 *         description: Token ausente, inválido o vencido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Foto no encontrada
 *       413:
 *         description: La imagen supera el tamaño máximo
 */
router.put('/:id', auth, soloAdmin, subirImagen, v.actualizar, validar, c.actualizar);

/**
 * @swagger
 * /fotos-galeria/{id}:
 *   delete:
 *     summary: Eliminar una foto y su archivo (solo admin)
 *     tags: [Fotos de galería]
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
 *         description: Foto eliminada correctamente
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token ausente, inválido o vencido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Foto no encontrada
 */
router.delete('/:id', auth, soloAdmin, v.id, validar, c.eliminar);

export default router;
