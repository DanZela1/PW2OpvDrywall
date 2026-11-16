import { body, param, query, ValidationChain } from 'express-validator';

// Reglas reutilizables de express-validator: cada validator del proyecto solo las combina.

type Opciones = { max?: number; requerido?: boolean };

export const id: ValidationChain[] = [
  param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo').toInt(),
];

export const paginacion: ValidationChain[] = [
  query('pagina').optional().isInt({ min: 1 }).withMessage('pagina debe ser un entero mayor o igual a 1').toInt(),
  query('limite').optional().isInt({ min: 1, max: 100 }).withMessage('limite debe estar entre 1 y 100').toInt(),
];

// Búsqueda, rango de fechas y orden de los listados (se combinan con `paginacion`)
export const busqueda: ValidationChain[] = [
  query('q').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('q debe tener entre 1 y 100 caracteres'),
  query('desde').optional().isISO8601().withMessage('desde debe ser una fecha válida (AAAA-MM-DD)').toDate(),
  query('hasta').optional().isISO8601().withMessage('hasta debe ser una fecha válida (AAAA-MM-DD)')
    // si solo viene la fecha (AAAA-MM-DD), incluye todo ese día
    .customSanitizer((v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? `${v}T23:59:59.999Z` : v))
    .toDate(),
];

// Orden: solo se aceptan las columnas de la lista, así nadie puede ordenar por campos internos
export const ordenable = (campos: readonly string[]): ValidationChain[] => [
  query('ordenarPor').optional().isIn(campos).withMessage(`ordenarPor debe ser uno de: ${campos.join(', ')}`),
  query('dir').optional().toLowerCase().isIn(['asc', 'desc']).withMessage('dir debe ser asc o desc'),
];

// Campo obligatorio (debe existir) u opcional (solo se valida si viene)
const inicio = (campo: string, requerido: boolean): ValidationChain =>
  requerido
    ? body(campo).exists({ values: 'null' }).withMessage(`${campo} es obligatorio`).bail()
    : body(campo).optional();

export const texto = (campo: string, { max = 100, requerido = true }: Opciones = {}): ValidationChain =>
  inicio(campo, requerido)
    .isString().withMessage(`${campo} debe ser texto`).bail()
    .trim().notEmpty().withMessage(`${campo} no puede estar vacío`).bail()
    .isLength({ max }).withMessage(`${campo} no puede superar ${max} caracteres`);

export const correo = (campo = 'correo', { requerido = true }: Opciones = {}): ValidationChain =>
  inicio(campo, requerido)
    .isString().withMessage(`${campo} debe ser texto`).bail()
    .trim().toLowerCase()
    .isEmail().withMessage(`${campo} debe ser un correo válido`).bail()
    .isLength({ max: 120 }).withMessage(`${campo} no puede superar 120 caracteres`);

export const telefono = (campo = 'telefono', { requerido = true }: Opciones = {}): ValidationChain =>
  inicio(campo, requerido)
    .isString().withMessage(`${campo} debe ser texto`).bail()
    .trim().matches(/^\d{8,10}$/).withMessage(`${campo} debe tener entre 8 y 10 dígitos`);

export const enumerado = (campo: string, valores: readonly string[], { requerido = true }: Opciones = {}): ValidationChain =>
  inicio(campo, requerido).isIn(valores).withMessage(`${campo} debe ser uno de: ${valores.join(', ')}`);

// Número decimal (precios y cantidades). `nullable` permite enviar null para vaciar el campo.
export const numero = (
  campo: string,
  { min = 0, max = 99999999, requerido = true, nullable = false }: { min?: number; max?: number; requerido?: boolean; nullable?: boolean } = {},
): ValidationChain => {
  const base = requerido ? body(campo).exists({ values: nullable ? 'undefined' : 'null' }).withMessage(`${campo} es obligatorio`).bail() : body(campo).optional({ nullable });
  return base
    .isFloat({ min, max }).withMessage(`${campo} debe ser un número entre ${min} y ${max}`)
    .toFloat();
};

// Entero positivo que apunta a un registro de otra tabla (categoriaId, proyectoId...)
export const referencia = (campo: string, { requerido = false, nullable = false }: { requerido?: boolean; nullable?: boolean } = {}): ValidationChain => {
  const base = requerido ? body(campo).exists({ values: 'null' }).withMessage(`${campo} es obligatorio`).bail() : body(campo).optional({ nullable });
  return base.isInt({ min: 1 }).withMessage(`${campo} debe ser un entero positivo`).toInt();
};

export const booleano = (campo: string, { requerido = false }: Opciones = {}): ValidationChain =>
  inicio(campo, requerido).isBoolean().withMessage(`${campo} debe ser true o false`).toBoolean();

// En las actualizaciones (PUT) exige que se envíe al menos un campo
// (un archivo adjunto cuenta como cambio, para poder reemplazar solo la imagen o el CV)
export const alMenosUnCampo: ValidationChain = body()
  .custom((valor, { req }) => !!req.file || (valor && typeof valor === 'object' && Object.keys(valor).length > 0))
  .withMessage('Envía al menos un campo o un archivo para actualizar');

export { body, query };
