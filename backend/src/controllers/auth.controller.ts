import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { matchedData } from 'express-validator';
import models from '../models';
import { JWT_ALGORITMO, PayloadToken } from '../config/passport';
import ApiError from '../utils/ApiError';
import h from '../utils/asyncHandler';
import {
  MINUTOS_ENLACE_RECUPERACION,
  notificarBienvenida,
  notificarPasswordCambiada,
  notificarRecuperacionPassword,
} from '../utils/notificaciones';

const { Usuario } = models;

const COSTO_HASH = 10;
const EXPIRACION_TOKEN = (process.env.JWT_EXPIRES_IN || '8h') as SignOptions['expiresIn'];

// Datos del usuario que sí se pueden devolver (nunca el hash)
const datosPublicos = (u: { id: number; nombre: string; correo: string; rol: string }) => ({
  id: u.id,
  nombre: u.nombre,
  correo: u.correo,
  rol: u.rol,
});

// El token solo lleva id y rol: no incluye correo, nombre ni nada sensible
const firmarToken = (u: { id: number; rol: 'admin' | 'cliente' }): string => {
  const payload: PayloadToken = { id: u.id, rol: u.rol };
  return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: EXPIRACION_TOKEN, algorithm: JWT_ALGORITMO });
};

export const registro = h(async (req, res) => {
  const { nombre, correo, password } = matchedData(req, { locations: ['body'] });
  if (await Usuario.findOne({ where: { correo } })) throw new ApiError(409, 'Ese correo ya está registrado');
  // El rol siempre es "cliente": nadie puede registrarse como admin
  const usuario = await Usuario.create({
    nombre,
    correo,
    passwordHash: await bcrypt.hash(password, COSTO_HASH),
    rol: 'cliente',
  });
  notificarBienvenida(usuario); // correo en segundo plano
  res.status(201).json(datosPublicos(usuario));
});

export const login = h(async (req, res) => {
  const { correo, password } = matchedData(req, { locations: ['body'] });
  const usuario = await Usuario.unscoped().findOne({ where: { correo } }); // unscoped: incluye passwordHash
  // El mismo mensaje si falla el correo o la contraseña, para no revelar cuál fue
  if (!usuario || !(await bcrypt.compare(password, usuario.passwordHash))) {
    throw new ApiError(401, 'Correo o contraseña incorrectos');
  }
  res.json({ token: firmarToken(usuario), tipo: 'Bearer', expiraEn: EXPIRACION_TOKEN, usuario: datosPublicos(usuario) });
});

export const me = h(async (req, res) => {
  const usuario = await Usuario.findByPk(req.user!.id);
  if (!usuario) throw new ApiError(404, 'Usuario no encontrado');
  res.json(usuario);
});

// PUT /auth/password: el usuario logueado cambia su propia contraseña
export const cambiarPassword = h(async (req, res) => {
  const { actual, nueva } = matchedData(req, { locations: ['body'] });
  const usuario = await Usuario.unscoped().findByPk(req.user!.id);
  if (!usuario) throw new ApiError(404, 'Usuario no encontrado');
  if (!(await bcrypt.compare(actual, usuario.passwordHash))) throw new ApiError(400, 'La contraseña actual es incorrecta');
  if (actual === nueva) throw new ApiError(400, 'La nueva contraseña debe ser distinta de la actual');

  await usuario.update({ passwordHash: await bcrypt.hash(nueva, COSTO_HASH) });
  notificarPasswordCambiada(usuario);
  res.json({ mensaje: 'Contraseña actualizada correctamente' });
});

// ---------------------------------------------------------------------------
// Recuperar contraseña sin tabla extra: el token de recuperación se firma con
// JWT_SECRET + el hash ACTUAL de la contraseña. Por eso:
//  - vence en 30 minutos,
//  - solo sirve una vez (al cambiar la contraseña el hash cambia y el token deja de verificar).
// ---------------------------------------------------------------------------
const secretoRecuperacion = (hashActual: string) => `${process.env.JWT_SECRET}.${hashActual}`;

// POST /auth/olvide-password: SIEMPRE responde igual, exista o no el correo (no revela quién tiene cuenta)
export const olvidePassword = h(async (req, res) => {
  const { correo } = matchedData(req, { locations: ['body'] });
  const usuario = await Usuario.unscoped().findOne({ where: { correo } });
  if (usuario) {
    const token = jwt.sign({ id: usuario.id, fin: 'recuperar' }, secretoRecuperacion(usuario.passwordHash), {
      expiresIn: `${MINUTOS_ENLACE_RECUPERACION}m`,
      algorithm: JWT_ALGORITMO,
    });
    notificarRecuperacionPassword(usuario, token);
  }
  res.json({ mensaje: 'Si el correo está registrado, te enviamos un enlace para recuperar tu contraseña.' });
});

// POST /auth/restablecer-password: valida el token y guarda la nueva contraseña
export const restablecerPassword = h(async (req, res) => {
  const { token, password } = matchedData(req, { locations: ['body'] });
  const invalido = new ApiError(400, 'El enlace de recuperación es inválido o ya venció');

  // Se lee el id SIN verificar solo para saber de qué usuario es; la verificación real viene después
  const sinVerificar = jwt.decode(token) as { id?: number } | null;
  if (!sinVerificar?.id) throw invalido;
  const usuario = await Usuario.unscoped().findByPk(sinVerificar.id);
  if (!usuario) throw invalido;

  try {
    const datos = jwt.verify(token, secretoRecuperacion(usuario.passwordHash), { algorithms: [JWT_ALGORITMO] }) as {
      fin?: string;
    };
    if (datos.fin !== 'recuperar') throw invalido;
  } catch {
    throw invalido;
  }

  await usuario.update({ passwordHash: await bcrypt.hash(password, COSTO_HASH) });
  notificarPasswordCambiada(usuario);
  res.json({ mensaje: 'Contraseña restablecida. Ya puedes iniciar sesión.' });
});
