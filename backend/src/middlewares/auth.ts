import { Request, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

const leerToken = (req: Request): string | undefined => req.headers.authorization?.split(' ')[1];

type DatosToken = { id: number; rol: 'admin' | 'cliente' };

// Exige un token válido; sin token o con token vencido responde 401
export const auth: RequestHandler = (req, res, next) => {
  const token = leerToken(req);
  if (!token) return res.status(401).json({ error: 'No autenticado' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET as string) as DatosToken;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Lee el token si viene, pero deja pasar a los visitantes (cotización pública)
export const authOpcional: RequestHandler = (req, res, next) => {
  const token = leerToken(req);
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET as string) as DatosToken;
    } catch {
      /* token inválido: se trata como visitante */
    }
  }
  next();
};

// Solo deja pasar al rol admin; si no, responde 403
export const soloAdmin: RequestHandler = (req, res, next) => {
  if (req.user?.rol === 'admin') return next();
  res.status(403).json({ error: 'No tienes permiso para esta acción' });
};
