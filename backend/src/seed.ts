import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { crearBaseSiNoExiste } from './config/database';
import models from './models';

dotenv.config();

const EXT = path.extname(__filename);

(async () => {
  await crearBaseSiNoExiste();
  await models.sequelize.sync();
  // Ejecuta en orden cada archivo seeds/NN-nombre.seed
  const carpeta = path.join(__dirname, 'seeds');
  const archivos = fs.readdirSync(carpeta).filter((f) => f.endsWith(`.seed${EXT}`) && !f.endsWith('.d.ts')).sort();
  for (const archivo of archivos) {
    const seed = require(path.join(carpeta, archivo)).default;
    console.log(await seed(models));
  }
  await models.sequelize.close();
})().catch((e: Error) => {
  console.error('Error en el seed:', e.message);
  process.exit(1);
});
