import { ErrorRequestHandler, RequestHandler } from 'express';

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
};

// Traduce cualquier error a una respuesta HTTP uniforme
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // JSON mal formado en el body
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });

  // Errores lanzados a propósito con ApiError(status, mensaje)
  if (err.status) return res.status(err.status).json({ error: err.message });

  switch (err.name) {
    case 'SequelizeUniqueConstraintError':
      return res.status(409).json({
        error: 'Ya existe un registro con esos datos',
        errores: err.errors.map((e: { path: string; message: string }) => ({ campo: e.path, mensaje: e.message })),
      });
    case 'SequelizeValidationError':
      return res.status(400).json({
        error: 'Datos inválidos',
        errores: err.errors.map((e: { path: string; message: string }) => ({ campo: e.path, mensaje: e.message })),
      });
    case 'SequelizeForeignKeyConstraintError':
      return res.status(400).json({ error: 'Referencia a un registro que no existe' });
    default:
      console.error(err);
      return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
