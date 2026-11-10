import { Router } from 'express';
import c from '../controllers/contacto.controller';
import * as v from '../validators/contacto.validator';
import validar from '../middlewares/validar';
import { auth, soloAdmin } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Contacto
 *   description: Mensajes de contacto (envío público, gestión solo admin)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Contacto:
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
 *         mensaje:
 *           type: string
 *           example: Quisiera una cotización para un cielo falso.
 *         leido:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /contacto:
 *   post:
 *     summary: Enviar un mensaje de contacto (público)
 *     tags: [Contacto]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, correo, mensaje]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Carlos López
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: carlos@mail.com
 *               mensaje:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Quisiera una cotización para un cielo falso.
 *     responses:
 *       201:
 *         description: Mensaje enviado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contacto'
 *       400:
 *         description: Datos inválidos
 */
router.post('/', v.crear, validar, c.crear); // público

/**
 * @swagger
 * /contacto:
 *   get:
 *     summary: Listar mensajes de contacto (solo admin)
 *     tags: [Contacto]
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
 *         name: leido
 *         schema:
 *           type: boolean
 *         description: Filtrar por mensajes leídos o no leídos
 *     responses:
 *       200:
 *         description: Lista de mensajes
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
 *                     $ref: '#/components/schemas/Contacto'
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 */
router.get('/', auth, soloAdmin, v.listar, validar, c.listar);

/**
 * @swagger
 * /contacto/{id}:
 *   get:
 *     summary: Obtener un mensaje por ID (solo admin)
 *     tags: [Contacto]
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
 *         description: Mensaje encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contacto'
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Mensaje no encontrado
 */
router.get('/:id', auth, soloAdmin, v.id, validar, c.obtener);

/**
 * @swagger
 * /contacto/{id}:
 *   put:
 *     summary: Marcar un mensaje como leído o no leído (solo admin)
 *     tags: [Contacto]
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
 *             required: [leido]
 *             properties:
 *               leido:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Mensaje actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contacto'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Mensaje no encontrado
 */
router.put('/:id', auth, soloAdmin, v.actualizar, validar, c.actualizar);

/**
 * @swagger
 * /contacto/{id}:
 *   delete:
 *     summary: Eliminar un mensaje (solo admin)
 *     tags: [Contacto]
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
 *         description: Mensaje eliminado correctamente
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Mensaje no encontrado
 */
router.delete('/:id', auth, soloAdmin, v.id, validar, c.eliminar);

export default router;