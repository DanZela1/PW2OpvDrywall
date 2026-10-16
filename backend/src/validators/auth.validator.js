const { body, texto, correo } = require('./comunes');

const password = () => body('password')
  .exists({ values: 'null' }).withMessage('password es obligatorio').bail()
  .isString().withMessage('password debe ser texto').bail()
  .isLength({ min: 6, max: 72 }).withMessage('password debe tener entre 6 y 72 caracteres');

exports.registro = [texto('nombre'), correo(), password()];
exports.login = [
  correo(),
  body('password').exists({ values: 'null' }).withMessage('password es obligatorio').bail().isString().withMessage('password debe ser texto'),
];
exports.password = password;
