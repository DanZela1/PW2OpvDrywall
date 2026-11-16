import { RequestHandler } from 'express';
import passport from 'passport';
import ApiError from '../utils/ApiError';

type Rol = Express.User['rol'];

/**
 * Autentica con la estrategia JWT de Passport.
 * - obligatorio = true : sin token válido responde 401 con un mensaje claro
 * - obligatorio = false: si el token falta o es inválido, sigue como visitante (cotización pública)
 */
const autenticar =
  (obligatorio: boolean): RequestHandler =>
  (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (error: unknown, usuario: Express.User | false, info: unknown) => {
      if (error) return next(error);
      if (usuario) {
        req.user = usuario;
        return next();
      }
      if (!obligatorio) return next();

      // `info` trae el motivo por el que falló la verificación del token
      const motivo = info instanceof Error ? info : undefined;
      res.set('WWW-Authenticate', 'Bearer');
      if (motivo?.name === 'TokenExpiredError') {
        return next(new ApiError(401, 'Tu sesión expiró, inicia sesión de nuevo'));
      }
      if (motivo?.message === 'No auth token') {
        return next(new ApiError(401, 'No autenticado: falta el token (Authorization: Bearer <token>)'));
      }
      return next(new ApiError(401, 'Token inválido'));
    })(req, res, next);
  };

// Exige un token válido: sin token, vencido o inválido responde 401
export const auth: RequestHandler = autenticar(true);

// Lee el token si viene, pero deja pasar a los visitantes
export const authOpcional: RequestHandler = autenticar(false);

// Deja pasar solo a los roles indicados; a los demás les responde 403 (ya autenticados, sin permiso)
export const permitirRoles =
  (...roles: Rol[]): RequestHandler =>
  (req, _res, next) => {
    if (req.user && roles.includes(req.user.rol)) return next();
    next(new ApiError(403, 'No tienes permiso para esta acción'));
  };

export const soloAdmin: RequestHandler = permitirRoles('admin');
