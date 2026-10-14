require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

const origenes = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((s) => s.trim());
app.use(cors({ origin: origenes }));
app.use(morgan('dev'));                    // registra cada petición HTTP en consola
app.use(express.json({ limit: '100kb' }));

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
