const { matchedData } = require('express-validator');
const { Cotizacion, Proyecto } = require('../models');
const ApiError = require('../utils/ApiError');
const crearCrud = require('../utils/crudFactory');
const h = require('../utils/asyncHandler');

const crud = crearCrud(Cotizacion, {
  nombre: 'Cotización',
  include: [{ model: Proyecto, as: 'proyecto', attributes: ['id', 'codigo', 'estado'] }],
  // Si quien envía está logueado, la cotización queda asociada a su usuario
  antesDeCrear: async (req, datos) => ({ ...datos, usuarioId: req.user?.id ?? null }),
});

// PATCH /api/cotizaciones/:id/estado  (PB-02)
crud.cambiarEstado = h(async (req, res) => {
  const cotizacion = await Cotizacion.findByPk(req.params.id);
  if (!cotizacion) throw new ApiError(404, 'No se encontró la cotización indicada');
  const { estado } = matchedData(req, { locations: ['body'] });
  await cotizacion.update({ estado });
  res.json({ id: cotizacion.id, estado: cotizacion.estado });
});

// GET /api/cotizaciones/mias  -> las cotizaciones del cliente logueado
crud.listarMias = h(async (req, res) => {
  res.json(await Cotizacion.findAll({ where: { usuarioId: req.user.id }, order: [['id', 'DESC']] }));
});

module.exports = crud;
