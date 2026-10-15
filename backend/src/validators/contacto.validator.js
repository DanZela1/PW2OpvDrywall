const { id, paginacion, texto, correo, booleano, alMenosUnCampo, query } = require('./comunes');

exports.id = id;
exports.listar = [...paginacion, query('leido').optional().isBoolean().withMessage('leido debe ser true o false').toBoolean()];
exports.crear = [texto('nombre'), correo(), texto('mensaje', { max: 1000 })];
exports.actualizar = [...id, alMenosUnCampo, booleano('leido')];
