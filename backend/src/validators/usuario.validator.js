const { id, paginacion, texto, correo, enumerado, alMenosUnCampo, body, query } = require('./comunes');

const ROLES = ['admin', 'cliente'];
const password = (requerido) => {
  const c = requerido ? body('password').exists({ values: 'null' }).withMessage('password es obligatorio').bail() : body('password').optional();
  return c.isString().withMessage('password debe ser texto').bail().isLength({ min: 6, max: 72 }).withMessage('password debe tener entre 6 y 72 caracteres');
};

exports.id = id;
exports.listar = [...paginacion, query('rol').optional().isIn(ROLES).withMessage(`rol debe ser uno de: ${ROLES.join(', ')}`)];
exports.crear = [texto('nombre'), correo(), password(true), enumerado('rol', ROLES, { requerido: false })];
exports.actualizar = [...id, alMenosUnCampo, texto('nombre', { requerido: false }), correo('correo', { requerido: false }), password(false), enumerado('rol', ROLES, { requerido: false })];
