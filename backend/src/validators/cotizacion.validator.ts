import { id as idRegla, paginacion, texto, correo, telefono, enumerado, alMenosUnCampo, query } from './comunes';
import { ESTADOS } from '../models/Cotizacion';

export const id = idRegla;
export const listar = [
  ...paginacion,
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
  texto('descripcion', { max: 1000, requerido: false }), enumerado('estado', ESTADOS, { requerido: false }),
];
export const estado = [...idRegla, enumerado('estado', ESTADOS)];
