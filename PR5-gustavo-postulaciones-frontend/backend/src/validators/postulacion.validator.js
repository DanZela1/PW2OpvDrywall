const { id, paginacion, texto, correo, telefono, enumerado, alMenosUnCampo, query } = require('./comunes');
const { ESTADOS } = require('../models/Postulacion');

exports.id = id;
exports.listar = [...paginacion, query('estado').optional().isIn(ESTADOS).withMessage(`estado debe ser uno de: ${ESTADOS.join(', ')}`)];
exports.crear = [texto('nombre'), correo(), telefono(), texto('experiencia', { max: 1000, requerido: false })];
exports.actualizar = [
  ...id, alMenosUnCampo,
  texto('nombre', { requerido: false }), correo('correo', { requerido: false }), telefono('telefono', { requerido: false }),
  texto('experiencia', { max: 1000, requerido: false }), enumerado('estado', ESTADOS, { requerido: false }),
];
exports.estado = [...id, enumerado('estado', ESTADOS)];
