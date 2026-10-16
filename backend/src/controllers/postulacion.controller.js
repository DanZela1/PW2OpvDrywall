const { matchedData } = require('express-validator');
const { Postulacion } = require('../models');
const ApiError = require('../utils/ApiError');
const crearCrud = require('../utils/crudFactory');
const h = require('../utils/asyncHandler');

const crud = crearCrud(Postulacion, { nombre: 'Postulación' });

// PATCH /api/postulaciones/:id/estado
crud.cambiarEstado = h(async (req, res) => {
  const postulacion = await Postulacion.findByPk(req.params.id);
  if (!postulacion) throw new ApiError(404, 'No se encontró la postulación indicada');
  const { estado } = matchedData(req, { locations: ['body'] });
  await postulacion.update({ estado });
  res.json({ id: postulacion.id, estado: postulacion.estado });
});

module.exports = crud;
