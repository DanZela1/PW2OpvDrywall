import { id as idRegla, paginacion, texto, correo, booleano, alMenosUnCampo, query } from './comunes';

export const id = idRegla;
export const listar = [...paginacion, query('leido').optional().isBoolean().withMessage('leido debe ser true o false').toBoolean()];
export const crear = [texto('nombre'), correo(), texto('mensaje', { max: 1000 })];
export const actualizar = [...idRegla, alMenosUnCampo, booleano('leido')];
