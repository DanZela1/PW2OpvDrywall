import { id as idRegla, paginacion, busqueda, ordenable, texto, booleano, alMenosUnCampo, body, query } from './comunes';

const orden = body('orden').optional().isInt({ min: 0, max: 9999 }).withMessage('orden debe ser un entero entre 0 y 9999').toInt();

export const id = idRegla;
export const listar = [
  ...paginacion,
  ...busqueda,
  ...ordenable(['id', 'orden', 'pregunta']),
  query('activo').optional().isBoolean().withMessage('activo debe ser true o false').toBoolean(),
];
export const crear = [texto('pregunta', { max: 255 }), texto('respuesta', { max: 2000 }), orden, booleano('activo')];
export const actualizar = [
  ...idRegla,
  alMenosUnCampo,
  texto('pregunta', { max: 255, requerido: false }),
  texto('respuesta', { max: 2000, requerido: false }),
  orden,
  booleano('activo'),
];
