import { body, texto, correo } from './comunes';

export const password = () =>
  body('password')
    .exists({ values: 'null' }).withMessage('password es obligatorio').bail()
    .isString().withMessage('password debe ser texto').bail()
    .isLength({ min: 6, max: 72 }).withMessage('password debe tener entre 6 y 72 caracteres');

export const registro = [texto('nombre'), correo(), password()];

export const login = [
  correo(),
  body('password')
    .exists({ values: 'null' }).withMessage('password es obligatorio').bail()
    .isString().withMessage('password debe ser texto'),
];
