import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import routes from './routes';
import { configurarPassport } from './config/passport';
import { setupSwagger } from './config/swagger';
import { notFound, errorHandler } from './middlewares/errorHandler';
import { CARPETA_IMAGENES, CARPETA_TESTIMONIOS } from './middlewares/subida';

dotenv.config();

const app = express();

// Detrás de un proxy/hosting (Render, Railway...) pon TRUST_PROXY=1 para que el límite de peticiones use la IP real
app.set('trust proxy', Number(process.env.TRUST_PROXY) || 0);

// Sitios que pueden llamar a la API desde el navegador (CORS_ORIGINS en .env, separados por coma)
const origenes = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,https://danzela1.github.io')
  .split(',')
  .map((s) => s.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(cors({ origin: origenes }));
app.use(morgan('dev')); // registra cada petición HTTP en consola
app.use(express.json({ limit: '100kb' }));

configurarPassport(); // estrategia JWT
app.use(passport.initialize());

setupSwagger(app); // documentación en /api-docs

// Imágenes públicas (servicios y fotos de testimonios). Los CV NO se sirven aquí: se descargan con token de admin.
const estaticos = {
  maxAge: '7d',
  setHeaders: (res: express.Response) => res.setHeader('X-Content-Type-Options', 'nosniff'),
};
app.use('/uploads/imagenes', express.static(CARPETA_IMAGENES, estaticos));
app.use('/uploads/testimonios', express.static(CARPETA_TESTIMONIOS, estaticos));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;