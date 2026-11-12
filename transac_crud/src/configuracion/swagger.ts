import path from 'path';
import { fileURLToPath } from 'url';
import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// En ESM no existe __dirname, se reconstruye a partir de import.meta.url
const carpetaActual = path.dirname(fileURLToPath(import.meta.url));

const opciones: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Órdenes (CRUD transaccional)',
      version: '1.0.0',
      description:
        'CRUD de órdenes de compra con sus detalles. Cada escritura es una transacción: o se guarda TODO o NO se guarda NADA.',
    },
    servers: [{ url: '/' }],
  },
  // Lee los comentarios @swagger de las rutas (.ts en desarrollo, .js al compilar)
  apis: [path.join(carpetaActual, '../rutas/*.{ts,js}').replace(/\\/g, '/')],
};

export const configurarSwagger = (app: Express): void => {
  const especificacion = swaggerJsdoc(opciones);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(especificacion));
};
