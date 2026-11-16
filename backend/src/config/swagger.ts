import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de OPV Drywall',
      version: '3.2.0',
      description:
        'API REST de OPV Drywall: autenticación con JWT, cotizaciones, servicios, postulaciones con CV, ' +
        'clientes, materiales, proyectos, testimonios, preguntas frecuentes, categorías de galería y reportes.\n\n' +
        '**Cómo probar rutas protegidas:** haz POST /auth/login, copia el `token` de la respuesta, pulsa el botón ' +
        '**Authorize** y pégalo (sin escribir la palabra Bearer).\n\n' +
        '**Errores:** todas las rutas responden los errores con el mismo formato `{ "error": "mensaje" }` ' +
        '(los de validación agregan la lista `errores`).',
    },
    servers: [{ url: '/api', description: 'Esta misma API' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT que devuelve POST /auth/login. Se envía en el encabezado Authorization: Bearer <token>.',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: { error: { type: 'string', example: 'No se encontró el registro con id 99' } },
        },
        ErrorValidacion: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Datos inválidos' },
            errores: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  campo: { type: 'string', example: 'correo' },
                  ubicacion: { type: 'string', example: 'body' },
                  mensaje: { type: 'string', example: 'correo debe ser un correo válido' },
                },
              },
            },
          },
        },
      },
      // Parámetros de listado que comparten casi todos los GET de colección
      parameters: {
        Pagina: { in: 'query', name: 'pagina', schema: { type: 'integer', minimum: 1, default: 1 }, description: 'Número de página' },
        Limite: {
          in: 'query',
          name: 'limite',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          description: 'Registros por página (máximo 100)',
        },
        Busqueda: { in: 'query', name: 'q', schema: { type: 'string', maxLength: 100 }, description: 'Texto a buscar (coincidencia parcial)' },
        Desde: {
          in: 'query',
          name: 'desde',
          schema: { type: 'string', format: 'date' },
          description: 'Registros creados desde esta fecha (AAAA-MM-DD)',
        },
        Hasta: {
          in: 'query',
          name: 'hasta',
          schema: { type: 'string', format: 'date' },
          description: 'Registros creados hasta esta fecha, incluida (AAAA-MM-DD)',
        },
        Dir: { in: 'query', name: 'dir', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' }, description: 'Dirección del orden (con ordenarPor)' },
      },
    },
  },
  apis: [path.join(__dirname, '../routes/**/*.{ts,js}').replace(/\\/g, '/')],
};

// ---------------------------------------------------------------------------
// Completa lo que cada ruta no repite: esquemas de error y respuestas comunes.
// Así TODAS las operaciones documentan 400/401/403/404/409/413/429/500 con su esquema.
// ---------------------------------------------------------------------------
const ESQUEMA_ERROR: Record<string, string> = {
  '400': 'ErrorValidacion',
  '401': 'Error',
  '403': 'Error',
  '404': 'Error',
  '409': 'Error',
  '413': 'Error',
  '429': 'Error',
  '500': 'Error',
};
const METODOS = ['get', 'post', 'put', 'patch', 'delete'] as const;
const ORDEN_TAGS = [
  'Sistema',
  'Auth',
  'Servicios',
  'Cotizaciones',
  'Contacto',
  'Postulaciones',
  'Proyectos',
  'Testimonios',
  'Preguntas frecuentes',
  'Categorías de galería',
  'Clientes',
  'Materiales',
  'Reportes',
  'Usuarios',
];

/* eslint-disable @typescript-eslint/no-explicit-any */
function completarEspecificacion(spec: any): any {
  for (const operaciones of Object.values<any>(spec.paths ?? {})) {
    for (const metodo of METODOS) {
      const op = operaciones[metodo];
      if (!op) continue;
      op.responses ??= {};

      const exigeToken =
        Array.isArray(op.security) && op.security.length > 0 && op.security.every((s: object) => 'bearerAuth' in s);
      if (exigeToken) op.responses['401'] ??= { description: 'Token ausente, inválido o vencido' };
      if (op.requestBody || (op.parameters ?? []).length) op.responses['400'] ??= { description: 'Datos inválidos' };
      op.responses['500'] ??= { description: 'Error interno del servidor' };

      for (const [codigo, ref] of Object.entries(ESQUEMA_ERROR)) {
        const respuesta = op.responses[codigo];
        if (respuesta && !respuesta.content) {
          respuesta.content = { 'application/json': { schema: { $ref: `#/components/schemas/${ref}` } } };
        }
      }
    }
  }

  if (Array.isArray(spec.tags)) {
    const posicion = (t: { name: string }) => {
      const i = ORDEN_TAGS.indexOf(t.name);
      return i === -1 ? ORDEN_TAGS.length : i;
    };
    spec.tags.sort((a: { name: string }, b: { name: string }) => posicion(a) - posicion(b));
  }
  return spec;
}

export const specs = completarEspecificacion(swaggerJsdoc(options));

export const setupSwagger = (app: Express): void => {
  // La especificación OpenAPI en JSON (útil para importarla en otras herramientas)
  app.get('/api-docs.json', (_req, res) => res.json(specs));

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      customSiteTitle: 'API OPV Drywall',
      swaggerOptions: {
        persistAuthorization: true, // el token sigue puesto aunque recargues la página
        displayRequestDuration: true,
        filter: true,
        docExpansion: 'none',
      },
    }),
  );
};
