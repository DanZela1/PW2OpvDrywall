import { Router } from 'express';
import c from '../controllers/pregunta.controller';
import * as v from '../validators/pregunta.validator';
import validar from '../middlewares/validar';
import { auth, authOpcional, soloAdmin } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Preguntas frecuentes
 *   description: Preguntas y respuestas del sitio (lectura pública, gestión solo admin)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PreguntaFrecuente:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         pregunta:
 *           type: string
 *           example: ¿Ofrecen garantía del trabajo?
 *         respuesta:
 *           type: string
 *           example: Sí, todos los proyectos tienen garantía en materiales y mano de obra.
 *         orden:
 *           type: integer
 *           description: Posición en la lista (menor aparece primero)
 *           example: 5
 *         activo:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     PreguntaFrecuenteEntrada:
 *       type: object
 *       properties:
 *         pregunta:
 *           type: string
 *           maxLength: 255
 *           example: ¿Ofrecen garantía del trabajo?
 *         respuesta:
 *           type: string
 *           maxLength: 2000
 *           example: Sí, todos los proyectos tienen garantía en materiales y mano de obra.
 *         orden:
 *           type: integer
 *           minimum: 0
 *           maximum: 9999
 *           example: 5
 *         activo:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /preguntas-frecuentes:
 *   get:
 *     summary: Listar preguntas frecuentes (público ve solo las activas)
 *     tags: [Preguntas frecuentes]
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
 *           enum: [id, orden, pregunta]
 *       - $ref: '#/components/parameters/Dir'
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Solo tiene efecto para el admin
 *     responses:
 *       200:
 *         description: Lista ordenada por el campo `orden`
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
 *                     $ref: '#/components/schemas/PreguntaFrecuente'
 *       400:
 *         description: Parámetros inválidos
 */
router.get('/', authOpcional, v.listar, validar, c.listar);

/**
 * @swagger
 * /preguntas-frecuentes/{id}:
 *   get:
 *     summary: Obtener una pregunta por ID (público solo si está activa)
 *     tags: [Preguntas frecuentes]
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
 *         description: Pregunta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PreguntaFrecuente'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Pregunta no encontrada
 */
router.get('/:id', authOpcional, v.id, validar, c.obtener);

/**
 * @swagger
 * /preguntas-frecuentes:
 *   post:
 *     summary: Crear una pregunta frecuente (solo admin)
 *     tags: [Preguntas frecuentes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/PreguntaFrecuenteEntrada'
 *               - type: object
 *                 required: [pregunta, respuesta]
 *     responses:
 *       201:
 *         description: Pregunta creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PreguntaFrecuente'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente, inválido o vencido
 *       403:
 *         description: No tiene permisos de administrador
 *       409:
 *         description: Ya existe esa pregunta
 */
router.post('/', auth, soloAdmin, v.crear, validar, c.crear);

/**
 * @swagger
 * /preguntas-frecuentes/{id}:
 *   put:
 *     summary: Actualizar una pregunta frecuente (solo admin, al menos un campo)
 *     tags: [Preguntas frecuentes]
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
 *             $ref: '#/components/schemas/PreguntaFrecuenteEntrada'
 *     responses:
 *       200:
 *         description: Pregunta actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PreguntaFrecuente'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente, inválido o vencido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Pregunta no encontrada
 *       409:
 *         description: Ya existe esa pregunta
 */
router.put('/:id', auth, soloAdmin, v.actualizar, validar, c.actualizar);

/**
 * @swagger
 * /preguntas-frecuentes/{id}:
 *   delete:
 *     summary: Eliminar una pregunta frecuente (solo admin)
 *     tags: [Preguntas frecuentes]
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
 *         description: Pregunta eliminada correctamente
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token ausente, inválido o vencido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Pregunta no encontrada
 */
router.delete('/:id', auth, soloAdmin, v.id, validar, c.eliminar);

export default router;
