import { Router } from 'express';
import c from '../controllers/testimonio.controller';
import * as v from '../validators/testimonio.validator';
import validar from '../middlewares/validar';
import { auth, authOpcional, soloAdmin } from '../middlewares/auth';
import { subirFotoTestimonio } from '../middlewares/subida';
import { limitePublico } from '../middlewares/limitador';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Testimonios
 *   description: Opiniones de clientes. Cualquiera puede enviar una; solo se publican cuando un admin la aprueba.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Testimonio:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: María López
 *         rol:
 *           type: string
 *           nullable: true
 *           example: Propietaria de vivienda
 *         texto:
 *           type: string
 *           example: Hicieron un trabajo impecable en las paredes de mi casa.
 *         calificacion:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           nullable: true
 *           example: 5
 *         foto:
 *           type: string
 *           nullable: true
 *           description: Ruta pública de la foto
 *           example: /uploads/testimonios/1793-ab12cd34ef56.jpg
 *         correo:
 *           type: string
 *           format: email
 *           nullable: true
 *           description: Solo lo ve un administrador
 *         estado:
 *           type: string
 *           enum: [pendiente, aprobado, rechazado]
 *           description: Solo lo ve un administrador
 *           example: aprobado
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     TestimonioEntrada:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           maxLength: 100
 *           example: María López
 *         rol:
 *           type: string
 *           maxLength: 100
 *           example: Propietaria de vivienda
 *         texto:
 *           type: string
 *           maxLength: 600
 *           example: Hicieron un trabajo impecable en las paredes de mi casa.
 *         calificacion:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           example: 5
 *         correo:
 *           type: string
 *           format: email
 *           example: maria@mail.com
 *         foto:
 *           type: string
 *           format: binary
 *           description: Imagen JPG, PNG o WebP (máximo 5 MB)
 */

/**
 * @swagger
 * /testimonios:
 *   get:
 *     summary: Listar testimonios (público ve solo los aprobados; el admin ve todos)
 *     description: Sin token devuelve únicamente los aprobados y sin datos privados. Con token de admin devuelve todos y permite filtrar por `estado`.
 *     tags: [Testimonios]
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
 *           enum: [id, createdAt, nombre, calificacion, estado]
 *       - $ref: '#/components/parameters/Dir'
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, aprobado, rechazado]
 *         description: Solo tiene efecto para el admin
 *     responses:
 *       200:
 *         description: Lista de testimonios
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
 *                     $ref: '#/components/schemas/Testimonio'
 *       400:
 *         description: Parámetros inválidos
 */
router.get('/', authOpcional, v.listar, validar, c.listar);

/**
 * @swagger
 * /testimonios/{id}:
 *   get:
 *     summary: Obtener un testimonio por ID (público solo si está aprobado)
 *     tags: [Testimonios]
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
 *         description: Testimonio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Testimonio'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Testimonio no encontrado (o aún no aprobado)
 */
router.get('/:id', authOpcional, v.id, validar, c.obtener);

/**
 * @swagger
 * /testimonios:
 *   post:
 *     summary: Enviar un testimonio (público; queda pendiente de aprobación)
 *     description: Acepta JSON o multipart/form-data (para adjuntar la foto en el campo `foto`). Siempre se guarda como `pendiente`.
 *     tags: [Testimonios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/TestimonioEntrada'
 *               - type: object
 *                 required: [nombre, texto]
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/TestimonioEntrada'
 *               - type: object
 *                 required: [nombre, texto]
 *     responses:
 *       201:
 *         description: Testimonio recibido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 5
 *                 mensaje:
 *                   type: string
 *                   example: Gracias por tu testimonio. Se publicará cuando sea aprobado.
 *       400:
 *         description: Datos inválidos o tipo de archivo no permitido
 *       413:
 *         description: La foto supera el tamaño máximo
 *       429:
 *         description: Demasiadas solicitudes desde la misma IP
 */
router.post('/', limitePublico, subirFotoTestimonio, v.crear, validar, c.crear);

/**
 * @swagger
 * /testimonios/{id}:
 *   put:
 *     summary: Editar un testimonio (solo admin, al menos un campo)
 *     tags: [Testimonios]
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
 *             $ref: '#/components/schemas/TestimonioEntrada'
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/TestimonioEntrada'
 *     responses:
 *       200:
 *         description: Testimonio actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Testimonio'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente, inválido o vencido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Testimonio no encontrado
 *       413:
 *         description: La foto supera el tamaño máximo
 */
router.put('/:id', auth, soloAdmin, subirFotoTestimonio, v.actualizar, validar, c.actualizar);

/**
 * @swagger
 * /testimonios/{id}/estado:
 *   patch:
 *     summary: Aprobar, rechazar o dejar pendiente un testimonio (solo admin)
 *     tags: [Testimonios]
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
 *                 enum: [pendiente, aprobado, rechazado]
 *                 example: aprobado
 *     responses:
 *       200:
 *         description: Estado actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 estado:
 *                   type: string
 *       400:
 *         description: Estado inválido
 *       401:
 *         description: Token ausente, inválido o vencido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Testimonio no encontrado
 */
router.patch('/:id/estado', auth, soloAdmin, v.estado, validar, c.cambiarEstado);

/**
 * @swagger
 * /testimonios/{id}:
 *   delete:
 *     summary: Eliminar un testimonio y su foto (solo admin)
 *     tags: [Testimonios]
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
 *         description: Testimonio eliminado correctamente
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token ausente, inválido o vencido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Testimonio no encontrado
 */
router.delete('/:id', auth, soloAdmin, v.id, validar, c.eliminar);

export default router;
