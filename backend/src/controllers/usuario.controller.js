const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');
const ApiError = require('../utils/ApiError');
const crearCrud = require('../utils/crudFactory');

// El password llega en texto plano solo en la petición; en la BD se guarda el hash
const aplicarHash = async (req, { password, ...resto }) =>
  password === undefined ? resto : { ...resto, passwordHash: await bcrypt.hash(password, 10) };

module.exports = crearCrud(Usuario, {
  nombre: 'Usuario',
  antesDeCrear: aplicarHash,
  antesDeActualizar: aplicarHash,
  antesDeEliminar: async (req, usuario) => {
    if (req.user.id === usuario.id) throw new ApiError(400, 'No puedes eliminar tu propio usuario');
  },
});
