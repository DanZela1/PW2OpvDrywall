import dotenv from 'dotenv';
import { sequelize, crearBaseSiNoExiste } from './config/database';
import { asegurarColumnas } from './config/columnas';
import './models'; // registra modelos y relaciones antes de sincronizar
import app from './app';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en backend/.env (copia .env.example a .env)');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

async function iniciar(): Promise<void> {
  try {
    await crearBaseSiNoExiste();
    await sequelize.authenticate();
    await sequelize.sync(); // crea las tablas si no existen
    await asegurarColumnas(); // agrega columnas de archivos a bases ya creadas
    console.log(`Conectado a MySQL (${process.env.DB_NAME || 'opv_drywall'})`);
    app.listen(PORT, () => console.log(`API corriendo en http://localhost:${PORT}`));
  } catch (err) {
    const error = err as NodeJS.ErrnoException & { message: string };
    console.error('No se pudo iniciar el servidor:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('-> MySQL no está encendido o DB_HOST/DB_PORT son incorrectos en .env');
    }
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('-> Usuario o contraseña de MySQL incorrectos (DB_USER / DB_PASSWORD en .env)');
    }
    process.exit(1);
  }
}

iniciar();
