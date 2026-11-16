import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import ApiError from '../utils/ApiError';

dotenv.config();

// Limita las peticiones por IP para frenar fuerza bruta (login) y spam (formularios públicos).
// Al pasar el límite responde 429 con el mismo formato de error del resto de la API.
const crear = (max: number, minutos: number, mensaje: string) =>
  rateLimit({
    windowMs: minutos * 60 * 1000,
    limit: max,
    standardHeaders: 'draft-7', // encabezados RateLimit-* para que el frontend sepa cuánto falta
    legacyHeaders: false,
    skip: () => process.env.RATE_LIMIT_DISABLED === 'true', // solo para pruebas automáticas
    handler: (_req, _res, next) => next(new ApiError(429, mensaje)),
  });

// Login, registro y recuperación de contraseña (por defecto 20 intentos cada 15 minutos)
export const limiteAuth = crear(
  Number(process.env.RATE_LIMIT_AUTH_MAX) || 20,
  15,
  'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
);

// Formularios públicos: cotización, contacto, testimonios (por defecto 30 envíos cada 15 minutos)
export const limitePublico = crear(
  Number(process.env.RATE_LIMIT_PUBLIC_MAX) || 30,
  15,
  'Has enviado demasiadas solicitudes. Inténtalo de nuevo más tarde.',
);
