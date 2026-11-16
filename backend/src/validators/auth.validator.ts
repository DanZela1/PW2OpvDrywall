import { body, texto, correo } from './comunes';

export const password = (campo = 'password') =>
  body(campo)
    .exists({ values: 'null' }).withMessage(`${campo} es obligatorio`).bail()
    .isString().withMessage(`${campo} debe ser texto`).bail()
    .isLength({ min: 6, max: 72 }).withMessage(`${campo} debe tener entre 6 y 72 caracteres`);

export const registro = [texto('nombre'), correo(), password()];

export const login = [
  correo(),
  body('password')
    .exists({ values: 'null' }).withMessage('password es obligatorio').bail()
    .isString().withMessage('password debe ser texto'),
];

export const olvidePassword = [correo()];

export const restablecerPassword = [
  body('token')
    .exists({ values: 'null' }).withMessage('token es obligatorio').bail()
    .isString().withMessage('token debe ser texto').bail()
    .isLength({ min: 20, max: 1000 }).withMessage('token inválido'),
  password('password'),
];

export const cambiarPassword = [
  body('actual')
    .exists({ values: 'null' }).withMessage('actual es obligatorio').bail()
    .isString().withMessage('actual debe ser texto'),
  password('nueva'),
];
