import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions } from 'passport-jwt';
import models from '../models';

// Lo único que lleva el token: quién es y qué rol tiene. Nunca correo, hash ni datos personales.
export interface PayloadToken {
  id: number;
  rol: 'admin' | 'cliente';
}

export const JWT_ALGORITMO = 'HS256';

/**
 * Registra la estrategia "jwt" de Passport.
 * Passport lee el token del encabezado `Authorization: Bearer <token>`, verifica firma y
 * expiración, y luego esta función confirma que el usuario todavía existe en la base de datos
 * y toma su rol ACTUAL (si a un admin le quitan el rol, el cambio vale de inmediato).
 */
export function configurarPassport(): void {
  const opciones: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET as string,
    algorithms: [JWT_ALGORITMO], // se rechaza cualquier otro algoritmo (ej. "none")
  };

  passport.use(
    'jwt',
    new JwtStrategy(opciones, async (payload: PayloadToken, done) => {
      try {
        const usuario = await models.Usuario.findByPk(payload.id);
        if (!usuario) return done(null, false);
        return done(null, { id: usuario.id, rol: usuario.rol });
      } catch (error) {
        return done(error as Error, false);
      }
    }),
  );
}

export default passport;
