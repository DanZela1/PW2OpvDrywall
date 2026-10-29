import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';

// Si alguna regla de express-validator falló, responde 400 con la lista de errores
const validar: RequestHandler = (req, res, next) => {
  const resultado = validationResult(req);
  if (resultado.isEmpty()) return next();
  res.status(400).json({
    error: 'Datos inválidos',
    errores: resultado.array().map((e) => ({
      campo: 'path' in e ? e.path : e.type,
      ubicacion: 'location' in e ? e.location : undefined,
      mensaje: e.msg,
    })),
  });
};

export default validar;
