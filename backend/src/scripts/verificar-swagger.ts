// Comprueba que CADA ruta de Express esté documentada en Swagger (y al revés).
// Uso: npm run docs:check   -> termina con error si falta o sobra algo.
import fs from 'fs';
import path from 'path';
import { specs } from '../config/swagger';

const EXT = path.extname(__filename);
const carpetaRutas = path.join(__dirname, '..', 'routes');

// "/:id/estado" -> "/{id}/estado"
const aOpenApi = (ruta: string) => ruta.replace(/:([A-Za-z0-9_]+)/g, '{$1}').replace(/\/+$/, '') || '/';

const enExpress = new Set<string>();

// /salud está en routes/index; el resto se monta como /<archivo>.routes
enExpress.add('GET /salud');

for (const archivo of fs.readdirSync(carpetaRutas).filter((f) => f.endsWith(`.routes${EXT}`) && !f.endsWith('.d.ts'))) {
  const prefijo = `/${archivo.replace(`.routes${EXT}`, '')}`;
  const router = require(path.join(carpetaRutas, archivo)).default;
  for (const capa of router.stack) {
    if (!capa.route) continue; // middlewares como router.use(auth)
    for (const metodo of Object.keys(capa.route.methods)) {
      const ruta = capa.route.path === '/' ? prefijo : `${prefijo}${capa.route.path}`;
      enExpress.add(`${metodo.toUpperCase()} ${aOpenApi(ruta)}`);
    }
  }
}

const enSwagger = new Set<string>();
for (const [ruta, operaciones] of Object.entries<Record<string, unknown>>(specs.paths ?? {})) {
  for (const metodo of Object.keys(operaciones)) {
    if (['get', 'post', 'put', 'patch', 'delete'].includes(metodo)) enSwagger.add(`${metodo.toUpperCase()} ${ruta}`);
  }
}

const sinDocumentar = [...enExpress].filter((r) => !enSwagger.has(r)).sort();
const sobrantes = [...enSwagger].filter((r) => !enExpress.has(r)).sort();

console.log(`Rutas en Express: ${enExpress.size} | Rutas en Swagger: ${enSwagger.size}`);
if (sinDocumentar.length) console.error('SIN DOCUMENTAR en Swagger:\n  ' + sinDocumentar.join('\n  '));
if (sobrantes.length) console.error('DOCUMENTADAS en Swagger pero que NO existen:\n  ' + sobrantes.join('\n  '));
if (sinDocumentar.length || sobrantes.length) process.exit(1);
console.log('✔ Todas las rutas están documentadas en Swagger.');
process.exit(0);
