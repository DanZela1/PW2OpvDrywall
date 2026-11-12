import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  listarOrdenes,
  obtenerOrdenPorId,
  crearOrden,
  actualizarOrden,
  eliminarOrden,
} from '../controladores/controladorOrdenes.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Ordenes Transaccionales
 *   description: CRUD transaccional de órdenes de compra con sus detalles (o se guarda TODO o NO se guarda NADA)
 */

// Ruta para listar todas las órdenes con sus detalles
/**
 * @swagger
 * /api/transac-crud:
 *   get:
 *     summary: Listar todas las órdenes con sus detalles
 *     description: Devuelve todas las órdenes (cabecera) junto con la lista de productos (detalles) de cada una. Operación de lectura, no requiere transacción.
 *     tags: [Ordenes Transaccionales]
 *     responses:
 *       200:
 *         description: Lista de órdenes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Orden'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', listarOrdenes);

// Ruta para obtener una orden por su ID
/**
 * @swagger
 * /api/transac-crud/buscarid:
 *   get:
 *     summary: Obtener una orden por su ID
 *     description: Devuelve una orden específica (cabecera + detalles) según su ID.
 *     tags: [Ordenes Transaccionales]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la orden a buscar
 *     responses:
 *       200:
 *         description: Orden obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Orden'
 *       400:
 *         description: ID inválido o faltante
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/buscarid',
  [
    query('id')
      .notEmpty()
      .withMessage('El ID de la orden es obligatorio')
      .isInt({ min: 1 })
      .withMessage('El ID de la orden debe ser un número entero positivo'),
  ],
  obtenerOrdenPorId
);

// Ruta para crear una nueva orden de forma TRANSACCIONAL
/**
 * @swagger
 * /api/transac-crud/guardar:
 *   post:
 *     summary: Crear una orden con sus detalles (transaccional)
 *     description: |
 *       Crea la orden (tabla ordenes) y TODOS sus detalles (tabla detalles_orden)
 *       dentro de una MISMA transacción de base de datos.
 *
 *       - Si todo sale bien, se ejecuta COMMIT y se guarda la orden completa.
 *       - Si algo falla, se ejecuta ROLLBACK y NO se guarda nada (ni la orden ni los detalles).
 *
 *       **Para comprobar el ROLLBACK:** envíe `"simularError": true` en el cuerpo.
 *       La petición fallará con 500 y podrá verificar con el endpoint de listado
 *       que la orden NO fue creada, a pesar de que la cabecera llegó a insertarse.
 *     tags: [Ordenes Transaccionales]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrdenCrear'
 *           example:
 *             numeroOrden: ORD-001
 *             clienteNombre: Maria Perez
 *             observaciones: Entregar en biblioteca central
 *             detalles:
 *               - producto: Resma de papel carta
 *                 cantidad: 10
 *                 precioUnitario: 150.50
 *               - producto: Caja de lapiceros azules
 *                 cantidad: 5
 *                 precioUnitario: 80.00
 *             simularError: false
 *     responses:
 *       201:
 *         description: Orden creada exitosamente (transacción confirmada con COMMIT)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Orden'
 *       400:
 *         description: Datos inválidos (errores de validación)
 *       409:
 *         description: Ya existe una orden con ese número (transacción revertida con ROLLBACK)
 *       500:
 *         description: Error al crear la orden (transacción revertida con ROLLBACK)
 */
router.post(
  '/guardar',
  [
    body('numeroOrden')
      .isString()
      .withMessage('El número de orden debe ser texto')
      .bail()
      .trim()
      .notEmpty()
      .withMessage('El número de orden es obligatorio')
      .isLength({ min: 3, max: 20 })
      .withMessage('El número de orden debe tener entre 3 y 20 caracteres'),
    body('clienteNombre')
      .isString()
      .withMessage('El nombre del cliente debe ser texto')
      .bail()
      .trim()
      .notEmpty()
      .withMessage('El nombre del cliente es obligatorio')
      .isLength({ min: 3, max: 100 })
      .withMessage('El nombre del cliente debe tener entre 3 y 100 caracteres'),
    body('observaciones')
      .optional({ values: 'null' })
      .isLength({ max: 255 })
      .withMessage('Las observaciones deben tener un máximo de 255 caracteres'),
    body('detalles')
      .isArray({ min: 1 })
      .withMessage('La orden debe incluir al menos un detalle (producto)'),
    body('detalles.*.producto')
      .isString()
      .withMessage('El producto debe ser texto')
      .bail()
      .trim()
      .notEmpty()
      .withMessage('El nombre del producto es obligatorio')
      .isLength({ min: 3, max: 100 })
      .withMessage('El producto debe tener entre 3 y 100 caracteres'),
    body('detalles.*.cantidad')
      .isInt({ min: 1 })
      .withMessage('La cantidad debe ser un entero mayor o igual a 1'),
    body('detalles.*.precioUnitario')
      .isFloat({ min: 0.01 })
      .withMessage('El precio unitario debe ser un número mayor que 0'),
    body('simularError')
      .optional()
      .isBoolean()
      .withMessage('simularError debe ser un valor booleano (true para probar el ROLLBACK)'),
  ],
  crearOrden
);

// Ruta para actualizar una orden existente de forma TRANSACCIONAL
/**
 * @swagger
 * /api/transac-crud/actualizar:
 *   put:
 *     summary: Actualizar una orden y reemplazar sus detalles (transaccional)
 *     description: |
 *       Dentro de una MISMA transacción:
 *       1) Se actualiza la cabecera de la orden (cliente / observaciones).
 *       2) Si se envían detalles, se eliminan los anteriores y se insertan los nuevos.
 *       3) Se recalcula el total.
 *
 *       Si algo falla, se ejecuta ROLLBACK y la orden queda EXACTAMENTE
 *       como estaba antes (los detalles anteriores no se pierden).
 *
 *       **Para comprobar el ROLLBACK:** envíe `"simularError": true` en el cuerpo.
 *     tags: [Ordenes Transaccionales]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la orden a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrdenActualizar'
 *           example:
 *             clienteNombre: Maria Perez Lopez
 *             observaciones: Entregar en el edificio de ingeniería
 *             detalles:
 *               - producto: Resma de papel oficio
 *                 cantidad: 3
 *                 precioUnitario: 180.25
 *             simularError: false
 *     responses:
 *       200:
 *         description: Orden actualizada exitosamente (transacción confirmada con COMMIT)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Orden'
 *       400:
 *         description: Datos inválidos (errores de validación)
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error al actualizar la orden (transacción revertida con ROLLBACK)
 */
router.put(
  '/actualizar',
  [
    query('id')
      .notEmpty()
      .withMessage('El ID de la orden es obligatorio')
      .isInt({ min: 1 })
      .withMessage('El ID de la orden debe ser un número entero positivo'),
    body('clienteNombre')
      .optional()
      .isString()
      .withMessage('El nombre del cliente debe ser texto')
      .bail()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('El nombre del cliente debe tener entre 3 y 100 caracteres'),
    body('observaciones')
      .optional({ values: 'null' })
      .isLength({ max: 255 })
      .withMessage('Las observaciones deben tener un máximo de 255 caracteres'),
    body('detalles')
      .optional()
      .isArray({ min: 1 })
      .withMessage('Si se envían detalles, la orden debe incluir al menos uno'),
    body('detalles.*.producto')
      .isString()
      .withMessage('El producto debe ser texto')
      .bail()
      .trim()
      .notEmpty()
      .withMessage('El nombre del producto es obligatorio')
      .isLength({ min: 3, max: 100 })
      .withMessage('El producto debe tener entre 3 y 100 caracteres'),
    body('detalles.*.cantidad')
      .isInt({ min: 1 })
      .withMessage('La cantidad debe ser un entero mayor o igual a 1'),
    body('detalles.*.precioUnitario')
      .isFloat({ min: 0.01 })
      .withMessage('El precio unitario debe ser un número mayor que 0'),
    body('simularError')
      .optional()
      .isBoolean()
      .withMessage('simularError debe ser un valor booleano (true para probar el ROLLBACK)'),
  ],
  actualizarOrden
);

// Ruta para eliminar una orden y sus detalles de forma TRANSACCIONAL
/**
 * @swagger
 * /api/transac-crud/eliminar:
 *   delete:
 *     summary: Eliminar una orden y sus detalles (transaccional)
 *     description: |
 *       Dentro de una MISMA transacción se eliminan primero los detalles
 *       (registros hijos) y luego la cabecera (registro padre).
 *       Si algo falla, se ejecuta ROLLBACK y no queda la orden a medias.
 *     tags: [Ordenes Transaccionales]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la orden a eliminar
 *     responses:
 *       200:
 *         description: Orden y sus detalles eliminados correctamente (transacción confirmada con COMMIT)
 *       400:
 *         description: ID inválido o faltante
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error al eliminar la orden (transacción revertida con ROLLBACK)
 */
router.delete(
  '/eliminar',
  [
    query('id')
      .notEmpty()
      .withMessage('El ID de la orden es obligatorio')
      .isInt({ min: 1 })
      .withMessage('El ID de la orden debe ser un número entero positivo'),
  ],
  eliminarOrden
);

// Esquemas reutilizables por Swagger
/**
 * @swagger
 * components:
 *   schemas:
 *     DetalleOrden:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del detalle
 *         ordenId:
 *           type: integer
 *           description: ID de la orden a la que pertenece (llave foránea)
 *         producto:
 *           type: string
 *           description: Nombre del producto
 *         cantidad:
 *           type: integer
 *           description: Cantidad de unidades del producto
 *         precioUnitario:
 *           type: number
 *           description: Precio por unidad
 *         subtotal:
 *           type: number
 *           description: cantidad * precioUnitario
 *     Orden:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la orden
 *         numeroOrden:
 *           type: string
 *           description: Número identificador de la orden (único)
 *         clienteNombre:
 *           type: string
 *           description: Nombre del cliente que solicita la orden
 *         observaciones:
 *           type: string
 *           nullable: true
 *           description: Observaciones de la orden
 *         total:
 *           type: number
 *           description: Suma de los subtotales de los detalles
 *         estado:
 *           type: boolean
 *           description: Estado de la orden (activo/inactivo)
 *         detalles:
 *           type: array
 *           description: Lista de productos (detalles) de la orden
 *           items:
 *             $ref: '#/components/schemas/DetalleOrden'
 *     DetalleCrear:
 *       type: object
 *       required: [producto, cantidad, precioUnitario]
 *       properties:
 *         producto:
 *           type: string
 *           description: Nombre del producto
 *         cantidad:
 *           type: integer
 *           description: Cantidad de unidades del producto
 *         precioUnitario:
 *           type: number
 *           description: Precio por unidad
 *     OrdenCrear:
 *       type: object
 *       required: [numeroOrden, clienteNombre, detalles]
 *       properties:
 *         numeroOrden:
 *           type: string
 *           description: Número identificador de la orden (único, entre 3 y 20 caracteres)
 *         clienteNombre:
 *           type: string
 *           description: Nombre del cliente (entre 3 y 100 caracteres)
 *         observaciones:
 *           type: string
 *           nullable: true
 *           description: Observaciones de la orden (opcional)
 *         detalles:
 *           type: array
 *           minItems: 1
 *           description: Productos que forman la orden (se insertan en la misma transacción)
 *           items:
 *             $ref: '#/components/schemas/DetalleCrear'
 *         simularError:
 *           type: boolean
 *           description: Enviar true para simular una falla y comprobar el ROLLBACK (didáctico, opcional)
 *     OrdenActualizar:
 *       type: object
 *       properties:
 *         clienteNombre:
 *           type: string
 *           description: Nuevo nombre del cliente
 *         observaciones:
 *           type: string
 *           nullable: true
 *           description: Nuevas observaciones
 *         detalles:
 *           type: array
 *           minItems: 1
 *           description: Si se envían, reemplazan por completo a los detalles anteriores
 *           items:
 *             $ref: '#/components/schemas/DetalleCrear'
 *         simularError:
 *           type: boolean
 *           description: Enviar true para simular una falla y comprobar el ROLLBACK (didáctico, opcional)
 */
export default router;
