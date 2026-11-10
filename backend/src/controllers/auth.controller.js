const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { matchedData } = require('express-validator');
const { Usuario } = require('../models');
const ApiError = require('../utils/ApiError');
const h = require('../utils/asyncHandler');

const datosPublicos = (u) => ({ id: u.id, nombre: u.nombre, correo: u.correo, rol: u.rol });

// POST /api/auth/registro -> siempre crea rol "cliente"
exports.registro = h(async (req, res) => {
  const { nombre, correo, password } = matchedData(req, { locations: ['body'] });
  if (await Usuario.findOne({ where: { correo } })) throw new ApiError(409, 'Ese correo ya está registrado');
  const usuario = await Usuario.create({ nombre, correo, passwordHash: await bcrypt.hash(password, 10), rol: 'cliente' });
  res.status(201).json(datosPublicos(usuario));
});

// POST /api/auth/login
exports.login = h(async (req, res) => {
  const { correo, password } = matchedData(req, { locations: ['body'] });
  const usuario = await Usuario.unscoped().findOne({ where: { correo } }); // unscoped: incluye passwordHash
  if (!usuario || !(await bcrypt.compare(password, usuario.passwordHash))) throw new ApiError(401, 'Correo o contraseña incorrectos');
  const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, usuario: datosPublicos(usuario) });
});

// GET /api/auth/me
exports.me = h(async (req, res) => {
  const usuario = await Usuario.findByPk(req.user.id);
  if (!usuario) throw new ApiError(404, 'Usuario no encontrado');
  res.json(usuario);
});
