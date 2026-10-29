const { Contacto } = require('../models');
const crearCrud = require('../utils/crudFactory');

module.exports = crearCrud(Contacto, { nombre: 'Mensaje de contacto' });
