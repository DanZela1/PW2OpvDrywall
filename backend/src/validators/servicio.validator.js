const { id, paginacion, texto, booleano, alMenosUnCampo, query } = require('./comunes');

exports.id = id;
exports.listar = [
  ...paginacion,
  query('activo').optional().isBoolean().withMessage('activo debe ser true o false').toBoolean(),
  query('categoria').optional().isString().trim().isLength({ min: 1, max: 60 }).withMessage('categoria inválida'),
];
exports.crear = [
  texto('nombre'), texto('descripcion', { max: 1000 }), texto('categoria', { max: 60 }),
  texto('contacto', { max: 120, requerido: false }), booleano('activo'),
];
exports.actualizar = [
  ...id, alMenosUnCampo,
  texto('nombre', { requerido: false }), texto('descripcion', { max: 1000, requerido: false }),
  texto('categoria', { max: 60, requerido: false }), texto('contacto', { max: 120, requerido: false }), booleano('activo'),
];
