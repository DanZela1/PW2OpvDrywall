import { Router } from 'express';
import c from '../controllers/usuario.controller';
import * as v from '../validators/usuario.validator';
import validar from '../middlewares/validar';
import { auth, soloAdmin } from '../middlewares/auth';

const router = Router();

router.use(auth, soloAdmin); // todo el módulo es solo para administradores

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios (todo el módulo es solo para administradores)
 */

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Listar usuarios (solo admin)
 *     tags: [Usuarios]
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
 *         name: rol
 *         schema:
 *           type: string
 *           enum: [admin, cliente]
 *         description: Filtrar por rol
 *     responses:
 *       200:
 *         description: Lista de usuarios
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
 *                     $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 */
router.get('/', v.listar, validar, c.listar);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obtener un usuario por ID (solo admin)
 *     tags: [Usuarios]
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
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', v.id, validar, c.obtener);

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crear un usuario (solo admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, correo, password]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Laura Gómez
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: laura@mail.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 72
 *                 example: "123456"
 *               rol:
 *                 type: string
 *                 enum: [admin, cliente]
 *                 example: cliente
 *     responses:
 *       201:
 *         description: Usuario creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       409:
 *         description: El correo ya está registrado
 */
router.post('/', v.crear, validar, c.crear);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Actualizar un usuario (solo admin, al menos un campo)
 *     tags: [Usuarios]
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
 *               nombre:
 *                 type: string
 *                 example: Laura Gómez
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: laura@mail.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 72
 *                 example: "nueva123"
 *               rol:
 *                 type: string
 *                 enum: [admin, cliente]
 *                 example: cliente
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: El correo ya está registrado
 */
router.put('/:id', v.actualizar, validar, c.actualizar);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Eliminar un usuario (solo admin)
 *     tags: [Usuarios]
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
 *         description: Usuario eliminado correctamente
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', v.id, validar, c.eliminar);

export default router;