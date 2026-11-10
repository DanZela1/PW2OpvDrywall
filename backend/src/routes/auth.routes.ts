import { Router } from 'express';
import * as c from '../controllers/auth.controller';
import * as v from '../validators/auth.validator';
import validar from '../middlewares/validar';
import { auth } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Registro, inicio de sesión y datos del usuario autenticado
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: Ana Pérez
 *         correo:
 *           type: string
 *           format: email
 *           example: ana@mail.com
 *         rol:
 *           type: string
 *           enum: [admin, cliente]
 *           example: cliente
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /auth/registro:
 *   post:
 *     summary: Registrar un nuevo usuario (rol cliente)
 *     tags: [Auth]
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
 *                 example: Ana Pérez
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: ana@mail.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 72
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: El correo ya está registrado
 */
router.post('/registro', v.registro, validar, c.registro);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión y obtener el token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo, password]
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: admin@opvdrywall.com
 *               password:
 *                 type: string
 *                 example: Admin123!
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT para usar en el botón Authorize
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', v.login, validar, c.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener los datos del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Token ausente o inválido
 */
router.get('/me', auth, c.me);

export default router;