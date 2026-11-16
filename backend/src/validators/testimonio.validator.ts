import { id as idRegla, paginacion, busqueda, ordenable, texto, correo, enumerado, alMenosUnCampo, body, query } from './comunes';
import { ESTADOS } from '../models/Testimonio';

const calificacion = body('calificacion')
  .optional({ values: 'falsy' })
  .isInt({ min: 1, max: 5 })
  .withMessage('calificacion debe ser un entero entre 1 y 5')
  .toInt();

export const id = idRegla;
export const listar = [
  ...paginacion,
  ...busqueda,
  ...ordenable(['id', 'createdAt', 'nombre', 'calificacion', 'estado']),
  query('estado').optional().isIn(ESTADOS).withMessage(`estado debe ser uno de: ${ESTADOS.join(', ')}`),
];
export const crear = [
  texto('nombre'),
  texto('rol', { max: 100, requerido: false }),
  texto('texto', { max: 600 }),
  calificacion,
  correo('correo', { requerido: false }),
];
export const actualizar = [
  ...idRegla,
  alMenosUnCampo,
  texto('nombre', { requerido: false }),
  texto('rol', { max: 100, requerido: false }),
  texto('texto', { max: 600, requerido: false }),
  calificacion,
  enumerado('estado', ESTADOS, { requerido: false }),
];
export const estado = [...idRegla, enumerado('estado', ESTADOS)];
