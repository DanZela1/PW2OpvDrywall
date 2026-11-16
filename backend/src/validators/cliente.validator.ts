import { id as idRegla, paginacion, busqueda, ordenable, texto, correo, telefono, alMenosUnCampo } from './comunes';

export const id = idRegla;
export const listar = [...paginacion, ...busqueda, ...ordenable(['id', 'createdAt', 'nombre', 'correo'])];
export const crear = [
  texto('nombre'), correo(), telefono(),
  texto('direccion', { max: 150, requerido: false }), texto('notas', { max: 1000, requerido: false }),
];
export const actualizar = [
  ...idRegla, alMenosUnCampo,
  texto('nombre', { requerido: false }), correo('correo', { requerido: false }), telefono('telefono', { requerido: false }),
  texto('direccion', { max: 150, requerido: false }), texto('notas', { max: 1000, requerido: false }),
];
