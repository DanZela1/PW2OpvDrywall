require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { crearBaseSiNoExiste } = require('./config/database');
const models = require('./models');

// Ejecuta en orden cada archivo "*.seed.js" de la carpeta seeds/ (npm run seed)
(async () => {
  await crearBaseSiNoExiste();
  await models.sequelize.sync();

  const carpeta = path.join(__dirname, 'seeds');
  for (const archivo of fs.readdirSync(carpeta).filter((f) => f.endsWith('.seed.js')).sort()) {
    console.log(await require(path.join(carpeta, archivo))(models));
  }
  await models.sequelize.close();
})().catch((e) => { console.error('Error en el seed:', e.message); process.exit(1); });
