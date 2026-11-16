import { ErrorRequestHandler, RequestHandler } from 'express';
import { MAX_MB } from './subida';

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
};

// Errores de Multer (subida de archivos) traducidos a un código HTTP y un mensaje claros
const errorDeMulter = (err: { code: string; field?: string }): { status: number; error: string } => {
  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      return { status: 413, error: `El archivo supera el tamaño máximo de ${MAX_MB} MB` };
    case 'LIMIT_FILE_COUNT':
    case 'LIMIT_UNEXPECTED_FILE':
      return {
        status: 400,
        error: err.field
          ? `Campo de archivo no permitido en esta ruta: "${err.field}" (solo se acepta un archivo)`
          : 'Solo se permite un archivo por petición',
      };
    default:
      return { status: 400, error: 'No se pudo procesar el archivo enviado' };
  }
};

// Traduce cualquier error a una respuesta HTTP uniforme
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // JSON mal formado en el body
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'El cuerpo de la petición es demasiado grande' });

  // Errores lanzados a propósito con ApiError(status, mensaje)
  if (err.status) return res.status(err.status).json({ error: err.message });

  switch (err.name) {
    case 'MulterError': {
      const { status, error } = errorDeMulter(err);
      return res.status(status).json({ error });
    }
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
