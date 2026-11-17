import { id as idRegla, paginacion, busqueda, ordenable, texto, numero, booleano, alMenosUnCampo, query } from './comunes';

export const id = idRegla;
export const listar = [
  ...paginacion, ...busqueda, ...ordenable(['id', 'createdAt', 'nombre', 'precioUnitario']),
  query('activo').optional().isBoolean().withMessage('activo debe ser true o false').toBoolean(),
];
export const crear = [
  texto('nombre'), texto('unidad', { max: 30 }), numero('precioUnitario', { max: 1000000 }), booleano('activo'),
];
export const actualizar = [
  ...idRegla, alMenosUnCampo,
  texto('nombre', { requerido: false }), texto('unidad', { max: 30, requerido: false }),
  numero('precioUnitario', { max: 1000000, requerido: false }), booleano('activo'),
];
