import { id as idRegla, paginacion, busqueda, ordenable, texto, referencia, booleano, alMenosUnCampo, query } from './comunes';

export const id = idRegla;
export const listar = [
  ...paginacion,
  ...busqueda,
  ...ordenable(['id', 'createdAt', 'titulo']),
  query('activa').optional().isBoolean().withMessage('activa debe ser true o false').toBoolean(),
  query('categoriaId').optional().isInt({ min: 1 }).withMessage('categoriaId debe ser un entero positivo').toInt(),
];
// La imagen no se valida aquí: llega como archivo (multer) y el controlador exige que exista al crear
export const crear = [
  texto('titulo'),
  texto('descripcion', { max: 255, requerido: false }),
  referencia('categoriaId', { requerido: true }),
  booleano('activa'),
];
export const actualizar = [
  ...idRegla,
  alMenosUnCampo,
  texto('titulo', { requerido: false }),
  texto('descripcion', { max: 255, requerido: false }),
  referencia('categoriaId'),
  booleano('activa'),
];
