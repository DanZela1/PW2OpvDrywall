const { validationResult } = require('express-validator');

// Punto ÚNICO de respuesta ante errores de validación (400 estandarizado)
module.exports = (req, res, next) => {
  const resultado = validationResult(req);
  if (resultado.isEmpty()) return next();
  res.status(400).json({
    error: 'Datos inválidos',
    errores: resultado.array().map((e) => ({ campo: e.path, ubicacion: e.location, mensaje: e.msg })),
  });
};
