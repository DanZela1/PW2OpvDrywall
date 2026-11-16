import 'dotenv/config';
import db, { crearBaseSiNoExiste } from './configuracion/db.js';
// Importar los modelos registra las tablas y sus asociaciones antes de db.sync()
import './modelos/index.js';
import app from './app.js';

// Puerto propio de esta API (la API principal usa 3000 y el sitio 5173)
const PUERTO = Number(process.env.PORT) || 3001;

const iniciar = async (): Promise<void> => {
  try {
    await crearBaseSiNoExiste(); // Crea la base de datos si no existe
    await db.authenticate(); // Comprueba la conexión con MySQL
    await db.sync(); // Crea las tablas ordenes y detalles_orden si no existen
    console.log('Conectado a MySQL y tablas sincronizadas');

    const servidor = app.listen(PUERTO, () => {
      console.log(`API corriendo en http://localhost:${PUERTO}`);
      console.log(`Swagger en http://localhost:${PUERTO}/api-docs`);
    });
    servidor.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`El puerto ${PUERTO} ya está en uso por otro programa.`);
        console.error('-> Cierra el otro programa o cambia PORT en transac_crud/.env');
      } else {
        console.error('Error del servidor:', error.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

void iniciar();
