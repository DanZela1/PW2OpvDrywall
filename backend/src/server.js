require('dotenv').config();
const { sequelize, crearBaseSiNoExiste } = require('./config/database');
require('./models'); // registra modelos y relaciones antes de sincronizar
const app = require('./app');

if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en backend/.env (copia .env.example a .env)');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

async function iniciar() {
  try {
    await crearBaseSiNoExiste();
    await sequelize.authenticate();
    await sequelize.sync();                // crea las tablas si no existen
    console.log(`Conectado a MySQL (${process.env.DB_NAME || 'opv_drywall'})`);
    app.listen(PORT, () => console.log(`API corriendo en http://localhost:${PORT}`));
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err.message);
    if (err.code === 'ECONNREFUSED') console.error('-> MySQL no está encendido o DB_HOST/DB_PORT son incorrectos en .env');
    if (err.code === 'ER_ACCESS_DENIED_ERROR') console.error('-> Usuario o contraseña de MySQL incorrectos (DB_USER / DB_PASSWORD en .env)');
    process.exit(1);
  }
}

iniciar();
