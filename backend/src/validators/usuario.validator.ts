import { ValidationChain } from 'express-validator';
import { id as idRegla, paginacion, texto, correo, enumerado, alMenosUnCampo, body, query } from './comunes';

const ROLES = ['admin', 'cliente'];

const password = (requerido: boolean): ValidationChain => {
  const base = requerido
    ? body('password').exists({ values: 'null' }).withMessage('password es obligatorio').bail()
    : body('password').optional();
  return base
    .isString().withMessage('password debe ser texto').bail()
    .isLength({ min: 6, max: 72 }).withMessage('password debe tener entre 6 y 72 caracteres');
};

export const id = idRegla;
export const listar = [...paginacion, query('rol').optional().isIn(ROLES).withMessage(`rol debe ser uno de: ${ROLES.join(', ')}`)];
export const crear = [texto('nombre'), correo(), password(true), enumerado('rol', ROLES, { requerido: false })];
export const actualizar = [
  ...idRegla, alMenosUnCampo,
  texto('nombre', { requerido: false }), correo('correo', { requerido: false }),
  password(false), enumerado('rol', ROLES, { requerido: false }),
];
