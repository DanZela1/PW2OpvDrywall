import { id as idRegla, paginacion, texto, correo, enumerado, alMenosUnCampo, body, query } from './comunes';
import { ESTADOS } from '../models/Proyecto';
import models from '../models';

// Si se envía cotizacionId, comprueba en la base que esa cotización exista
const cotizacionExiste = body('cotizacionId')
  .optional()
  .isInt({ min: 1 }).withMessage('cotizacionId debe ser un entero positivo').bail().toInt()
  .custom(async (valor: number) => {
    if (!(await models.Cotizacion.findByPk(valor))) throw new Error('La cotización indicada no existe');
    return true;
  });

export const id = idRegla;
export const listar = [
  ...paginacion,
  query('estado').optional().isIn(ESTADOS).withMessage(`estado debe ser uno de: ${ESTADOS.join(', ')}`),
];
export const crear = [
  cotizacionExiste,
  correo('clienteCorreo', { requerido: false }),
  body('clienteCorreo')
    .if(body('cotizacionId').not().exists())
    .exists({ values: 'null' }).withMessage('clienteCorreo es obligatorio si no se indica cotizacionId'),
  enumerado('estado', ESTADOS, { requerido: false }),
  texto('notas', { max: 1000, requerido: false }),
];
export const actualizar = [
  ...idRegla, alMenosUnCampo,
  correo('clienteCorreo', { requerido: false }), enumerado('estado', ESTADOS, { requerido: false }),
  texto('notas', { max: 1000, requerido: false }),
];
export const consulta = [correo('correo'), texto('codigo', { max: 20 })];
