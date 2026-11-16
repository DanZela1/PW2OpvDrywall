import { id as idRegla, paginacion, busqueda, ordenable, texto, booleano, alMenosUnCampo, query } from './comunes';

export const id = idRegla;
export const listar = [
  ...paginacion,
  ...busqueda,
  ...ordenable(['id', 'nombre']),
  query('activa').optional().isBoolean().withMessage('activa debe ser true o false').toBoolean(),
];
export const crear = [texto('nombre', { max: 60 }), texto('descripcion', { max: 255, requerido: false }), booleano('activa')];
export const actualizar = [
  ...idRegla,
  alMenosUnCampo,
  texto('nombre', { max: 60, requerido: false }),
  texto('descripcion', { max: 255, requerido: false }),
  booleano('activa'),
];
