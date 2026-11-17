import { Router } from 'express';
import * as c from '../controllers/auth.controller';
import * as v from '../validators/auth.validator';
import validar from '../middlewares/validar';
import { auth } from '../middlewares/auth';
import { limiteAuth } from '../middlewares/limitador';

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
 *       429:
 *         description: Demasiados intentos desde la misma IP
 */
router.post('/registro', limiteAuth, v.registro, validar, c.registro);

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
 *                   description: Token JWT firmado (HS256). Pégalo en el botón Authorize (sin la palabra Bearer). Solo contiene id y rol.
 *                 tipo:
 *                   type: string
 *                   example: Bearer
 *                 expiraEn:
 *                   type: string
 *                   description: Duración del token
 *                   example: 8h
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Credenciales incorrectas
 *       429:
 *         description: Demasiados intentos desde la misma IP
 */
router.post('/login', limiteAuth, v.login, validar, c.login);

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

/**
 * @swagger
 * /auth/password:
 *   put:
 *     summary: Cambiar la contraseña del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [actual, nueva]
 *             properties:
 *               actual:
 *                 type: string
 *                 example: "123456"
 *               nueva:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 72
 *                 example: "NuevaClave2026"
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Contraseña actualizada correctamente
 *       400:
 *         description: Datos inválidos o contraseña actual incorrecta
 *       401:
 *         description: Token ausente, inválido o vencido
 */
router.put('/password', auth, v.cambiarPassword, validar, c.cambiarPassword);

/**
 * @swagger
 * /auth/olvide-password:
 *   post:
 *     summary: Pedir un correo para recuperar la contraseña
 *     description: Siempre responde igual, exista o no el correo, para no revelar qué correos tienen cuenta. El enlace del correo vence en 30 minutos y solo sirve una vez.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo]
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: ana@mail.com
 *     responses:
 *       200:
 *         description: Solicitud recibida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Si el correo está registrado, te enviamos un enlace para recuperar tu contraseña.
 *       400:
 *         description: Correo inválido
 *       429:
 *         description: Demasiados intentos desde la misma IP
 */
router.post('/olvide-password', limiteAuth, v.olvidePassword, validar, c.olvidePassword);

/**
 * @swagger
 * /auth/restablecer-password:
 *   post:
 *     summary: Crear una contraseña nueva con el token recibido por correo
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token que viene en el enlace del correo
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 72
 *                 example: "NuevaClave2026"
 *     responses:
 *       200:
 *         description: Contraseña restablecida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Contraseña restablecida. Ya puedes iniciar sesión.
 *       400:
 *         description: Datos inválidos, o el enlace es inválido o ya venció
 *       429:
 *         description: Demasiados intentos desde la misma IP
 */
router.post('/restablecer-password', limiteAuth, v.restablecerPassword, validar, c.restablecerPassword);

export default router;