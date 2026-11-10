const { id, paginacion, texto, correo, enumerado, alMenosUnCampo, body, query } = require('./comunes');
const { ESTADOS } = require('../models/Proyecto');
const { Cotizacion } = require('../models');

const cotizacionExiste = body('cotizacionId')
  .optional()
  .isInt({ min: 1 }).withMessage('cotizacionId debe ser un entero positivo').bail().toInt()
  .custom(async (valor) => {
    if (!(await Cotizacion.findByPk(valor))) throw new Error('La cotización indicada no existe');
    return true;
  });

exports.id = id;
exports.listar = [...paginacion, query('estado').optional().isIn(ESTADOS).withMessage(`estado debe ser uno de: ${ESTADOS.join(', ')}`)];
exports.crear = [
  cotizacionExiste,
  // el correo del cliente es obligatorio salvo que se indique la cotización (se toma de ella)
  correo('clienteCorreo', { requerido: false }),
  body('clienteCorreo').if(body('cotizacionId').not().exists()).exists({ values: 'null' }).withMessage('clienteCorreo es obligatorio si no se indica cotizacionId'),
  enumerado('estado', ESTADOS, { requerido: false }),
  texto('notas', { max: 1000, requerido: false }),
];
exports.actualizar = [
  ...id, alMenosUnCampo,
  correo('clienteCorreo', { requerido: false }), enumerado('estado', ESTADOS, { requerido: false }), texto('notas', { max: 1000, requerido: false }),
];
exports.consulta = [correo('correo'), texto('codigo', { max: 20 })];
