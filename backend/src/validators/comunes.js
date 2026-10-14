const { body, param, query } = require('express-validator');

// ---- params / query ----
const id = [param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo').toInt()];

const paginacion = [
  query('pagina').optional().isInt({ min: 1 }).withMessage('pagina debe ser un entero mayor o igual a 1').toInt(),
  query('limite').optional().isInt({ min: 1, max: 100 }).withMessage('limite debe estar entre 1 y 100').toInt(),
];

// ---- campos del body ----
const inicio = (campo, requerido) =>
  requerido
    ? body(campo).exists({ values: 'null' }).withMessage(`${campo} es obligatorio`).bail()
    : body(campo).optional();

const texto = (campo, { max = 100, requerido = true } = {}) =>
  inicio(campo, requerido)
    .isString().withMessage(`${campo} debe ser texto`).bail()
    .trim().notEmpty().withMessage(`${campo} no puede estar vacío`).bail()
    .isLength({ max }).withMessage(`${campo} no puede superar ${max} caracteres`);

const correo = (campo = 'correo', { requerido = true } = {}) =>
  inicio(campo, requerido)
    .isString().withMessage(`${campo} debe ser texto`).bail()
    .trim().toLowerCase()
    .isEmail().withMessage(`${campo} debe ser un correo válido`).bail()
    .isLength({ max: 120 }).withMessage(`${campo} no puede superar 120 caracteres`);

const telefono = (campo = 'telefono', { requerido = true } = {}) =>
  inicio(campo, requerido)
    .isString().withMessage(`${campo} debe ser texto`).bail()
    .trim().matches(/^\d{8,10}$/).withMessage(`${campo} debe tener entre 8 y 10 dígitos`);

const enumerado = (campo, valores, { requerido = true } = {}) =>
  inicio(campo, requerido).isIn(valores).withMessage(`${campo} debe ser uno de: ${valores.join(', ')}`);

const booleano = (campo, { requerido = false } = {}) =>
  inicio(campo, requerido).isBoolean().withMessage(`${campo} debe ser true o false`).toBoolean();

// En un PUT al menos debe venir un campo
const alMenosUnCampo = body().custom((valor) => valor && typeof valor === 'object' && Object.keys(valor).length > 0)
  .withMessage('Envía al menos un campo para actualizar');

module.exports = { id, paginacion, texto, correo, telefono, enumerado, booleano, alMenosUnCampo, body, query };
