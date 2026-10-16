const { id, paginacion, texto, correo, telefono, enumerado, alMenosUnCampo, query } = require('./comunes');
const { ESTADOS } = require('../models/Cotizacion');

exports.id = id;
exports.listar = [...paginacion, query('estado').optional().isIn(ESTADOS).withMessage(`estado debe ser uno de: ${ESTADOS.join(', ')}`)];
exports.crear = [
  texto('nombre'), correo(), telefono(),
  texto('tipoServicio'), texto('ubicacion', { max: 150 }), texto('descripcion', { max: 1000 }),
];
exports.actualizar = [
  ...id, alMenosUnCampo,
  texto('nombre', { requerido: false }), correo('correo', { requerido: false }), telefono('telefono', { requerido: false }),
  texto('tipoServicio', { requerido: false }), texto('ubicacion', { max: 150, requerido: false }),
  texto('descripcion', { max: 1000, requerido: false }), enumerado('estado', ESTADOS, { requerido: false }),
];
exports.estado = [...id, enumerado('estado', ESTADOS)];
