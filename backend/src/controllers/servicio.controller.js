const { Servicio } = require('../models');
const crearCrud = require('../utils/crudFactory');

module.exports = crearCrud(Servicio, {
  nombre: 'Servicio',
  antesDeCrear: async (req, datos) => ({ ...datos, usuarioId: req.user.id }),
});
