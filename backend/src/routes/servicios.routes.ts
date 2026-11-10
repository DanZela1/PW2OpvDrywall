import { Router } from 'express';
import c from '../controllers/servicio.controller';
import * as v from '../validators/servicio.validator';
import validar from '../middlewares/validar';
import { auth, soloAdmin } from '../middlewares/auth';
import { subirImagen } from '../middlewares/subida';

const router = Router();

router.get('/', v.listar, validar, c.listar); // público
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
