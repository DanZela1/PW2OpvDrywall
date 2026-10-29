import { id as idRegla, paginacion, texto, correo, telefono, enumerado, alMenosUnCampo, query } from './comunes';
import { ESTADOS } from '../models/Postulacion';

export const id = idRegla;
export const listar = [
  ...paginacion,
  query('estado').optional().isIn(ESTADOS).withMessage(`estado debe ser uno de: ${ESTADOS.join(', ')}`),
];
export const crear = [texto('nombre'), correo(), telefono(), texto('experiencia', { max: 1000, requerido: false })];
export const actualizar = [
  ...idRegla, alMenosUnCampo,
  texto('nombre', { requerido: false }), correo('correo', { requerido: false }), telefono('telefono', { requerido: false }),
  texto('experiencia', { max: 1000, requerido: false }), enumerado('estado', ESTADOS, { requerido: false }),
];
export const estado = [...idRegla, enumerado('estado', ESTADOS)];
