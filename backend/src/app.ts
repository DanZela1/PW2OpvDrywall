import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes';
import { notFound, errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();

const origenes = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());

app.use(cors({ origin: origenes }));
app.use(morgan('dev')); // registra cada petición HTTP en consola
app.use(express.json({ limit: '100kb' }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
