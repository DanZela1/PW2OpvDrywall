const notFound = (req, res) => res.status(404).json({ error: 'Ruta no encontrada' });

// Middleware central de errores: nunca se filtra información interna al cliente
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
  if (err.status) return res.status(err.status).json({ error: err.message });

  switch (err.name) {
    case 'SequelizeUniqueConstraintError':
      return res.status(409).json({ error: 'Ya existe un registro con esos datos', errores: err.errors.map((e) => ({ campo: e.path, mensaje: e.message })) });
    case 'SequelizeValidationError':
      return res.status(400).json({ error: 'Datos inválidos', errores: err.errors.map((e) => ({ campo: e.path, mensaje: e.message })) });
    case 'SequelizeForeignKeyConstraintError':
      return res.status(400).json({ error: 'Referencia a un registro que no existe' });
    default:
      console.error(err);
      return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { notFound, errorHandler };
