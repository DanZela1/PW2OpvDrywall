import { id as idRegla, paginacion, busqueda, ordenable, texto, correo, telefono, enumerado, alMenosUnCampo, booleano, body, query } from './comunes';
import { TIPOS_ITEM } from '../models/CotizacionDetalle';
import { ESTADOS } from '../models/Cotizacion';

export const id = idRegla;
export const listar = [
  ...paginacion,
  ...busqueda,
  ...ordenable(['id', 'createdAt', 'nombre', 'estado', 'tipoServicio']),
  query('estado').optional().isIn(ESTADOS).withMessage(`estado debe ser uno de: ${ESTADOS.join(', ')}`),
];
export const crear = [
  texto('nombre'), correo(), telefono(),
  texto('tipoServicio'), texto('ubicacion', { max: 150 }), texto('descripcion', { max: 1000 }),
];
export const actualizar = [
  ...idRegla, alMenosUnCampo,
  texto('nombre', { requerido: false }), correo('correo', { requerido: false }), telefono('telefono', { requerido: false }),
  texto('tipoServicio', { requerido: false }), texto('ubicacion', { max: 150, requerido: false }),
  texto('descripcion', { max: 1000, requerido: false }),
  // el estado NO se cambia aquí: se usa PATCH /:id/estado, que valida el flujo y guarda el historial
];
export const estado = [
  ...idRegla,
  enumerado('estado', ESTADOS),
  body('comentario').optional().isString().withMessage('comentario debe ser texto').bail().trim().isLength({ max: 500 }).withMessage('comentario no puede superar 500 caracteres'),
];

// Ítems del detalle: servicio y material apuntan al catálogo; manual lleva descripción y precio propios
const items = [
  body('items').isArray({ min: 1, max: 50 }).withMessage('items debe ser una lista de 1 a 50 ítems'),
  body('items.*.tipo').isIn(TIPOS_ITEM).withMessage(`items.*.tipo debe ser uno de: ${TIPOS_ITEM.join(', ')}`),
  // servicioId / materialId obligatorios según el tipo: eso lo comprueba construirDetalle() contra la base
  body('items.*.servicioId').optional().isInt({ min: 1 }).withMessage('items.*.servicioId debe ser un entero positivo').toInt(),
  body('items.*.materialId').optional().isInt({ min: 1 }).withMessage('items.*.materialId debe ser un entero positivo').toInt(),
  body('items.*.descripcion').optional().isString().withMessage('items.*.descripcion debe ser texto').bail().trim()
    .isLength({ max: 200 }).withMessage('items.*.descripcion no puede superar 200 caracteres'),
  body('items.*.cantidad').isFloat({ min: 0.01, max: 1000000 }).withMessage('items.*.cantidad debe ser mayor que 0').toFloat(),
  body('items.*.precioUnitario').optional().isFloat({ min: 0, max: 100000000 }).withMessage('items.*.precioUnitario debe ser 0 o más').toFloat(),
];

// POST /con-detalle: el admin arma una cotización completa (cliente + datos + ítems)
export const conDetalle = [
  texto('cliente.nombre'), correo('cliente.correo'), telefono('cliente.telefono'),
  texto('cliente.direccion', { max: 150, requerido: false }),
  texto('tipoServicio'), texto('ubicacion', { max: 150 }), texto('descripcion', { max: 1000 }),
  booleano('aplicarImpuesto'),
  ...items,
];
