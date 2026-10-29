import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { matchedData } from 'express-validator';
import models from '../models';
import ApiError from '../utils/ApiError';
import h from '../utils/asyncHandler';

const { Usuario } = models;

// Datos del usuario que sí se pueden devolver (nunca el hash)
const datosPublicos = (u: { id: number; nombre: string; correo: string; rol: string }) => ({
  id: u.id,
  nombre: u.nombre,
  correo: u.correo,
  rol: u.rol,
});

export const registro = h(async (req, res) => {
  const { nombre, correo, password } = matchedData(req, { locations: ['body'] });
  if (await Usuario.findOne({ where: { correo } })) throw new ApiError(409, 'Ese correo ya está registrado');
  // El rol siempre es "cliente": nadie puede registrarse como admin
  const usuario = await Usuario.create({
    nombre,
    correo,
    passwordHash: await bcrypt.hash(password, 10),
    rol: 'cliente',
  });
  res.status(201).json(datosPublicos(usuario));
});

export const login = h(async (req, res) => {
  const { correo, password } = matchedData(req, { locations: ['body'] });
  const usuario = await Usuario.unscoped().findOne({ where: { correo } }); // unscoped: incluye passwordHash
  // El mismo mensaje si falla el correo o la contraseña, para no revelar cuál fue
  if (!usuario || !(await bcrypt.compare(password, usuario.passwordHash))) {
    throw new ApiError(401, 'Correo o contraseña incorrectos');
  }
  const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET as string, { expiresIn: '8h' });
  res.json({ token, usuario: datosPublicos(usuario) });
});

export const me = h(async (req, res) => {
  const usuario = await Usuario.findByPk(req.user!.id);
  if (!usuario) throw new ApiError(404, 'Usuario no encontrado');
  res.json(usuario);
});
