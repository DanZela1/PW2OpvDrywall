import { id as idRegla, paginacion, busqueda, ordenable, texto, correo, booleano, alMenosUnCampo, query } from './comunes';

export const id = idRegla;
export const listar = [...paginacion, ...busqueda, ...ordenable(['id', 'createdAt', 'nombre', 'leido']), query('leido').optional().isBoolean().withMessage('leido debe ser true o false').toBoolean()];
export const crear = [texto('nombre'), correo(), texto('mensaje', { max: 1000 })];
export const actualizar = [...idRegla, alMenosUnCampo, booleano('leido')];
