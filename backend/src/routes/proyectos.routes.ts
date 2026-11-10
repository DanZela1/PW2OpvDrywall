import { Router } from 'express';
import c from '../controllers/proyecto.controller';
import * as v from '../validators/proyecto.validator';
import validar from '../middlewares/validar';
import { auth, soloAdmin } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Proyectos
 *   description: Proyectos de OPV Drywall (consulta pública con código, gestión solo admin)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Proyecto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         codigo:
 *           type: string
 *           maxLength: 20
 *           example: PRY-0001
 *         clienteCorreo:
 *           type: string
 *           format: email
 *           example: carlos@mail.com
 *         estado:
 *           type: string
 *           enum: [Cotización enviada, En ejecución, Finalizado]
 *           example: En ejecución
 *         notas:
 *           type: string
 *           nullable: true
 *           maxLength: 1000
 *         cotizacionId:
 *           type: integer
 *           nullable: true
 *           description: Cotización de la que nació el proyecto (relación 1 a 1)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /proyectos/consulta:
 *   post:
 *     summary: Consultar el estado de un proyecto con correo y código (público)
 *     tags: [Proyectos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo, codigo]
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: carlos@mail.com
 *               codigo:
 *                 type: string
 *                 maxLength: 20
 *                 example: PRY-0001
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proyecto'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: No existe un proyecto con ese correo y código
 */
router.post('/consulta', v.consulta, validar, c.consultar); // público (PB-07)

/**
 * @swagger
 * /proyectos:
 *   get:
 *     summary: Listar proyectos (solo admin)
 *     tags: [Proyectos]
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
 *           enum: [Cotización enviada, En ejecución, Finalizado]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de proyectos
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
 *                     $ref: '#/components/schemas/Proyecto'
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
 * /proyectos/{id}:
 *   get:
 *     summary: Obtener un proyecto por ID (solo admin)
 *     tags: [Proyectos]
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
 *         description: Proyecto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proyecto'
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Proyecto no encontrado
 */
router.get('/:id', auth, soloAdmin, v.id, validar, c.obtener);

/**
 * @swagger
 * /proyectos:
 *   post:
 *     summary: Crear un proyecto (solo admin)
 *     description: Si se envía `cotizacionId`, la cotización debe existir. Si no se envía, `clienteCorreo` es obligatorio.
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cotizacionId:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *               clienteCorreo:
 *                 type: string
 *                 format: email
 *                 example: carlos@mail.com
 *               estado:
 *                 type: string
 *                 enum: [Cotización enviada, En ejecución, Finalizado]
 *                 example: Cotización enviada
 *               notas:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Cliente solicita iniciar la próxima semana.
 *     responses:
 *       201:
 *         description: Proyecto creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proyecto'
 *       400:
 *         description: Datos inválidos o cotización inexistente
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       409:
 *         description: La cotización ya tiene un proyecto asociado
 */
router.post('/', auth, soloAdmin, v.crear, validar, c.crear);

/**
 * @swagger
 * /proyectos/{id}:
 *   put:
 *     summary: Actualizar un proyecto (solo admin, al menos un campo)
 *     tags: [Proyectos]
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
 *             properties:
 *               clienteCorreo:
 *                 type: string
 *                 format: email
 *                 example: carlos@mail.com
 *               estado:
 *                 type: string
 *                 enum: [Cotización enviada, En ejecución, Finalizado]
 *                 example: En ejecución
 *               notas:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Se inició la instalación.
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proyecto'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Proyecto no encontrado
 */
router.put('/:id', auth, soloAdmin, v.actualizar, validar, c.actualizar);

/**
 * @swagger
 * /proyectos/{id}:
 *   delete:
 *     summary: Eliminar un proyecto (solo admin)
 *     tags: [Proyectos]
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
 *         description: Proyecto eliminado correctamente
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Proyecto no encontrado
 */
router.delete('/:id', auth, soloAdmin, v.id, validar, c.eliminar);

export default router;