import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';
import { sequelize } from '../config/database';

// Los modelos se cargan solos; se accede a ellos por nombre (models.Usuario, models.Cotizacion...)
export interface Modelos {
  sequelize: Sequelize;
  [nombre: string]: any;
}

const models: Modelos = { sequelize };

// ".ts" cuando corre con ts-node (npm run dev) y ".js" cuando corre compilado (npm start)
const EXT = path.extname(__filename);

const relaciones: Array<(m: Modelos) => void> = [];

// Carga automáticamente cada archivo de modelo de esta carpeta (menos index),
// así agregar un modelo nuevo no obliga a editar este archivo.
fs.readdirSync(__dirname)
  .filter((archivo) => archivo.endsWith(EXT) && !archivo.endsWith('.d.ts') && archivo !== `index${EXT}`)
  .forEach((archivo) => {
    const modulo = require(path.join(__dirname, archivo));
    const modelo = modulo.default;
    models[modelo.name] = modelo;
    // Cada modelo puede exportar `associate` para declarar sus relaciones
    if (typeof modulo.associate === 'function') relaciones.push(modulo.associate);
  });

relaciones.forEach((asociar) => asociar(models));

export default models;
