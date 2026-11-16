import { Router } from 'express';
import c from '../controllers/cotizacion.controller';
import * as v from '../validators/cotizacion.validator';
import validar from '../middlewares/validar';
import { auth, authOpcional, soloAdmin } from '../middlewares/auth';
import { limitePublico } from '../middlewares/limitador';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cotizaciones
 *   description: Solicitudes de cotización (envío público, gestión solo admin)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Cotizacion:
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
 *         telefono:
 *           type: string
 *           maxLength: 10
 *           example: "98765432"
 *         tipoServicio:
 *           type: string
 *           example: Cielo falso
 *         ubicacion:
 *           type: string
 *           maxLength: 150
 *           example: Tegucigalpa, Col. Kennedy
 *         descripcion:
 *           type: string
 *           maxLength: 1000
 *           example: Necesito cielo falso en una sala de 20 m2.
 *         estado:
 *           type: string
 *           enum: [pendiente, en_revision, enviada, aceptada, rechazada]
 *           example: pendiente
 *         usuarioId:
 *           type: integer
 *           nullable: true
 *           description: Usuario que la envió estando logueado (null si fue anónima)
 *         clienteId:
 *           type: integer
 *           nullable: true
 *           description: Cliente asociado (se crea o reutiliza por correo)
 *         subtotal:
 *           type: number
 *           nullable: true
 *         impuesto:
 *           type: number
 *           nullable: true
 *         total:
 *           type: number
 *           nullable: true
 *           description: Monto total (null mientras la cotización no tenga detalle)
 *         detalle:
 *           type: array
 *           description: Líneas de la cotización (solo en GET /cotizaciones/{id})
 *           items:
 *             $ref: '#/components/schemas/CotizacionItem'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CotizacionItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         tipo:
 *           type: string
 *           enum: [servicio, material, manual]
 *         servicioId:
 *           type: integer
 *           nullable: true
 *         materialId:
 *           type: integer
 *           nullable: true
 *         descripcion:
 *           type: string
 *         cantidad:
 *           type: number
 *         precioUnitario:
 *           type: number
 *         subtotal:
 *           type: number
 *     ItemEntrada:
 *       type: object
 *       required: [tipo, cantidad]
 *       properties:
 *         tipo:
 *           type: string
 *           enum: [servicio, material, manual]
 *         servicioId:
 *           type: integer
 *           description: Obligatorio si tipo = servicio
 *         materialId:
 *           type: integer
 *           description: Obligatorio si tipo = material
 *         descripcion:
 *           type: string
 *           maxLength: 200
 *           description: Obligatoria si tipo = manual (en los otros toma el nombre del catálogo)
 *         cantidad:
 *           type: number
 *           minimum: 0.01
 *           example: 20
 *         precioUnitario:
 *           type: number
 *           description: Obligatorio si tipo = manual; en los otros reemplaza el precio del catálogo
 *     CotizacionEntrada:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           example: Carlos López
 *         correo:
 *           type: string
 *           format: email
 *           example: carlos@mail.com
 *         telefono:
 *           type: string
 *           maxLength: 10
 *           example: "98765432"
 *         tipoServicio:
 *           type: string
 *           example: Cielo falso
 *         ubicacion:
 *           type: string
 *           maxLength: 150
 *           example: Tegucigalpa, Col. Kennedy
 *         descripcion:
 *           type: string
 *           maxLength: 1000
 *           example: Necesito cielo falso en una sala de 20 m2.
 */

/**
 * @swagger
 * /cotizaciones:
 *   post:
 *     summary: Solicitar una cotización (público; si hay token se asocia al usuario)
 *     tags: [Cotizaciones]
 *     security:
 *       - {}
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, correo, telefono, tipoServicio, ubicacion, descripcion]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Carlos López
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: carlos@mail.com
 *               telefono:
 *                 type: string
 *                 maxLength: 10
 *                 example: "98765432"
 *               tipoServicio:
 *                 type: string
 *                 example: Cielo falso
 *               ubicacion:
 *                 type: string
 *                 maxLength: 150
 *                 example: Tegucigalpa, Col. Kennedy
 *               descripcion:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Necesito cielo falso en una sala de 20 m2.
 *     responses:
 *       201:
 *         description: Cotización registrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cotizacion'
 *       400:
 *         description: Datos inválidos
 *       429:
 *         description: Demasiadas solicitudes desde la misma IP
 */
router.post('/', limitePublico, authOpcional, v.crear, validar, c.crear); // público (PB-01)

/**
 * @swagger
 * /cotizaciones/mias:
 *   get:
 *     summary: Listar las cotizaciones del cliente autenticado
 *     tags: [Cotizaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cotizaciones del usuario logueado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cotizacion'
 *       401:
 *         description: Token ausente o inválido
 */
router.get('/mias', auth, c.listarMias); // cliente logueado

/**
 * @swagger
 * /cotizaciones:
 *   get:
 *     summary: Listar todas las cotizaciones (solo admin)
 *     tags: [Cotizaciones]
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
 *       - $ref: '#/components/parameters/Busqueda'
 *       - $ref: '#/components/parameters/Desde'
 *       - $ref: '#/components/parameters/Hasta'
 *       - in: query
 *         name: ordenarPor
 *         schema:
 *           type: string
 *           enum: [id, createdAt, nombre, estado, tipoServicio]
 *       - $ref: '#/components/parameters/Dir'
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, en_revision, enviada, aceptada, rechazada]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de cotizaciones
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
 *                     $ref: '#/components/schemas/Cotizacion'
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 */
/**
 * @swagger
 * /cotizaciones/con-detalle:
 *   post:
 *     summary: Crear una cotización completa con cliente y detalle (solo admin, transacción)
 *     description: |
 *       En UNA transacción: busca o crea el cliente por correo, crea la cotización, guarda cada ítem del detalle,
 *       calcula subtotal, impuesto y total, y escribe el historial. Si algo falla (ej. un material que no existe) no se guarda nada.
 *       Los precios del catálogo se copian al detalle. El impuesto es IMPUESTO_PORCENTAJE (15 % por defecto) y se puede omitir con `aplicarImpuesto: false`.
 *     tags: [Cotizaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cliente, tipoServicio, ubicacion, descripcion, items]
 *             properties:
 *               cliente:
 *                 type: object
 *                 required: [nombre, correo, telefono]
 *                 properties:
 *                   nombre:
 *                     type: string
 *                   correo:
 *                     type: string
 *                     format: email
 *                   telefono:
 *                     type: string
 *                   direccion:
 *                     type: string
 *               tipoServicio:
 *                 type: string
 *               ubicacion:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               aplicarImpuesto:
 *                 type: boolean
 *                 default: true
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 50
 *                 items:
 *                   $ref: '#/components/schemas/ItemEntrada'
 *     responses:
 *       201:
 *         description: Cotización creada con su detalle y totales
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cotizacion'
 *       403:
 *         description: No tiene permisos de administrador
 */
router.post('/con-detalle', auth, soloAdmin, v.conDetalle, validar, c.crearConDetalle);

router.get('/', auth, soloAdmin, v.listar, validar, c.listar); // admin (PB-02)

/**
 * @swagger
 * /cotizaciones/{id}:
 *   get:
 *     summary: Obtener una cotización por ID (solo admin)
 *     tags: [Cotizaciones]
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
 *         description: Cotización encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cotizacion'
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Cotización no encontrada
 */
router.get('/:id', auth, soloAdmin, v.id, validar, c.obtener);

/**
 * @swagger
 * /cotizaciones/{id}:
 *   put:
 *     summary: Actualizar los datos de una cotización (solo admin, al menos un campo)
 *     description: No cambia el estado; para eso se usa PATCH /cotizaciones/{id}/estado (valida el flujo y guarda el historial).
 *     tags: [Cotizaciones]
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
 *             $ref: '#/components/schemas/CotizacionEntrada'
 *     responses:
 *       200:
 *         description: Cotización actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cotizacion'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Cotización no encontrada
 */
router.put('/:id', auth, soloAdmin, v.actualizar, validar, c.actualizar);

/**
 * @swagger
 * /cotizaciones/{id}/estado:
 *   patch:
 *     summary: Cambiar el estado de una cotización (solo admin, con transacción e historial)
 *     description: |
 *       Bloquea la cotización, valida el flujo y guarda el cambio junto con su historial en una sola transacción (si algo falla, no se guarda nada).
 *       Flujo permitido: pendiente → en_revision | enviada | rechazada; en_revision → enviada | rechazada; enviada → aceptada | rechazada; rechazada → pendiente; aceptada es final.
 *       Al terminar se avisa al cliente por correo.
 *     tags: [Cotizaciones]
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
 *                 enum: [pendiente, en_revision, enviada, aceptada, rechazada]
 *                 example: en_revision
 *               comentario:
 *                 type: string
 *                 maxLength: 500
 *                 example: Revisando medidas con el cliente
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
 *                   example: 1
 *                 estadoAnterior:
 *                   type: string
 *                   example: pendiente
 *                 estado:
 *                   type: string
 *                   example: en_revision
 *                 comentario:
 *                   type: string
 *                   nullable: true
 *                   example: Revisando medidas con el cliente
 *       400:
 *         description: Estado inválido
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Cotización no encontrada
 *       409:
 *         description: Cambio de estado no permitido por el flujo (o ya está en ese estado)
 */
router.patch('/:id/estado', auth, soloAdmin, v.estado, validar, c.cambiarEstado);

/**
 * @swagger
 * components:
 *   schemas:
 *     CotizacionHistorial:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 3
 *         cotizacionId:
 *           type: integer
 *           example: 1
 *         estadoAnterior:
 *           type: string
 *           nullable: true
 *           description: null en la primera fila (cuando se creó la cotización)
 *           example: pendiente
 *         estadoNuevo:
 *           type: string
 *           example: en_revision
 *         comentario:
 *           type: string
 *           nullable: true
 *           example: Revisando medidas con el cliente
 *         usuarioId:
 *           type: integer
 *           nullable: true
 *         autor:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /cotizaciones/{id}/historial:
 *   get:
 *     summary: Ver el historial de cambios de estado de una cotización (solo admin)
 *     tags: [Cotizaciones]
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
 *         description: Línea de tiempo, de la más antigua a la más reciente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CotizacionHistorial'
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token ausente, inválido o vencido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Cotización no encontrada
 */
router.get('/:id/historial', auth, soloAdmin, v.id, validar, c.historial);

/**
 * @swagger
 * /cotizaciones/{id}:
 *   delete:
 *     summary: Eliminar una cotización (solo admin)
 *     tags: [Cotizaciones]
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
 *         description: Cotización eliminada correctamente
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Cotización no encontrada
 */
router.delete('/:id', auth, soloAdmin, v.id, validar, c.eliminar);

export default router;