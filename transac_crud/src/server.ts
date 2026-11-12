import 'dotenv/config';
import db, { crearBaseSiNoExiste } from './configuracion/db.js';
// Importar los modelos registra las tablas y sus asociaciones antes de db.sync()
import './modelos/index.js';
import app from './app.js';

const PUERTO = Number(process.env.PORT) || 3000;

const iniciar = async (): Promise<void> => {
  try {
    await crearBaseSiNoExiste(); // Crea la base de datos si no existe
    await db.authenticate(); // Comprueba la conexión con MySQL
    await db.sync(); // Crea las tablas ordenes y detalles_orden si no existen
    console.log('Conectado a MySQL y tablas sincronizadas');

    app.listen(PUERTO, () => {
      console.log(`API corriendo en http://localhost:${PUERTO}`);
      console.log(`Swagger en http://localhost:${PUERTO}/api-docs`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

void iniciar();
