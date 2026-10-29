import { id as idRegla, paginacion, texto, booleano, alMenosUnCampo, query } from './comunes';

export const id = idRegla;
export const listar = [
  ...paginacion,
  query('activo').optional().isBoolean().withMessage('activo debe ser true o false').toBoolean(),
  query('categoria').optional().isString().trim().isLength({ min: 1, max: 60 }).withMessage('categoria inválida'),
];
export const crear = [
  texto('nombre'), texto('descripcion', { max: 1000 }), texto('categoria', { max: 60 }),
  texto('contacto', { max: 120, requerido: false }), booleano('activo'),
];
export const actualizar = [
  ...idRegla, alMenosUnCampo,
  texto('nombre', { requerido: false }), texto('descripcion', { max: 1000, requerido: false }),
  texto('categoria', { max: 60, requerido: false }), texto('contacto', { max: 120, requerido: false }), booleano('activo'),
];
