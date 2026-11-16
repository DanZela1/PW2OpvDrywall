import { query } from './comunes';

export const porMes = [
  query('meses').optional().isInt({ min: 1, max: 24 }).withMessage('meses debe estar entre 1 y 24').toInt(),
];
