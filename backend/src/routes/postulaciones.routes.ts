import { Router } from 'express';
import c from '../controllers/postulacion.controller';
import * as v from '../validators/postulacion.validator';
import validar from '../middlewares/validar';
import { auth, soloAdmin } from '../middlewares/auth';
import { subirCV } from '../middlewares/subida';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Postulaciones
 *   description: Postulaciones de personas que quieren trabajar con OPV Drywall (envío público, gestión solo admin)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Postulacion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: Mario Reyes
 *         correo:
 *           type: string
 *           format: email
 *           example: mario@mail.com
 *         telefono:
 *           type: string
 *           maxLength: 10
 *           example: "98765432"
 *         experiencia:
 *           type: string
 *           nullable: true
 *           maxLength: 1000
 *           example: 3 años instalando paneles de yeso.
 *         estado:
 *           type: string
 *           enum: [nueva, revisada, aceptada, rechazada]
 *           example: nueva
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     PostulacionEntrada:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           example: Mario Reyes
 *         correo:
 *           type: string
 *           format: email
 *           example: mario@mail.com
 *         telefono:
 *           type: string
 *           maxLength: 10
 *           example: "98765432"
 *         experiencia:
 *           type: string
 *           maxLength: 1000
 *           example: 3 años instalando paneles de yeso.
 *         estado:
 *           type: string
 *           enum: [nueva, revisada, aceptada, rechazada]
 */

/**
 * @swagger
 * /postulaciones:
 *   post:
 *     summary: Enviar una postulación (público)
 *     tags: [Postulaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, correo, telefono]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Mario Reyes
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: mario@mail.com
 *               telefono:
 *                 type: string
 *                 maxLength: 10
 *                 example: "98765432"
 *               experiencia:
 *                 type: string
 *                 maxLength: 1000
 *                 example: 3 años instalando paneles de yeso.
 *     responses:
 *       201:
 *         description: Postulación registrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Postulacion'
 *       400:
 *         description: Datos inválidos
 */
router.post('/', v.crear, validar, c.crear); // público (PB-09)

/**
 * @swagger
 * /postulaciones:
 *   get:
 *     summary: Listar postulaciones (solo admin)
 *     tags: [Postulaciones]
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
 *           enum: [nueva, revisada, aceptada, rechazada]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de postulaciones
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
 *                     $ref: '#/components/schemas/Postulacion'
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 */
router.get('/', auth, soloAdmin, v.listar, validar, c.listar);

/**
 * @swagger
 * /postulaciones/{id}:
 *   get:
 *     summary: Obtener una postulación por ID (solo admin)
 *     tags: [Postulaciones]
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
 *         description: Postulación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Postulacion'
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Postulación no encontrada
 */
router.get('/:id', auth, soloAdmin, v.id, validar, c.obtener);

/**
 * @swagger
 * /postulaciones/{id}:
 *   put:
 *     summary: Actualizar una postulación (solo admin, al menos un campo)
 *     tags: [Postulaciones]
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
 *             $ref: '#/components/schemas/PostulacionEntrada'
 *     responses:
 *       200:
 *         description: Postulación actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Postulacion'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Postulación no encontrada
 */
router.put('/:id', auth, soloAdmin, v.actualizar, validar, c.actualizar);

/**
 * @swagger
 * /postulaciones/{id}/estado:
 *   patch:
 *     summary: Cambiar el estado de una postulación (solo admin)
 *     tags: [Postulaciones]
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
 *                 enum: [nueva, revisada, aceptada, rechazada]
 *                 example: revisada
 *     responses:
 *       200:
 *         description: Estado actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Postulacion'
 *       400:
 *         description: Estado inválido
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Postulación no encontrada
 */
router.patch('/:id/estado', auth, soloAdmin, v.estado, validar, c.cambiarEstado);

/**
 * @swagger
 * /postulaciones/{id}:
 *   delete:
 *     summary: Eliminar una postulación (solo admin)
 *     tags: [Postulaciones]
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
 *         description: Postulación eliminada correctamente
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Postulación no encontrada
 */
router.delete('/:id', auth, soloAdmin, v.id, validar, c.eliminar);

export default router;