const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');

const models = { sequelize };

// Carga automáticamente cada archivo de modelo de esta carpeta (menos index.js),
// así agregar un modelo nuevo no obliga a editar este archivo.
fs.readdirSync(__dirname)
  .filter((archivo) => archivo.endsWith('.js') && archivo !== 'index.js')
  .forEach((archivo) => {
    const modelo = require(path.join(__dirname, archivo));
    models[modelo.name] = modelo;
  });

// Cada modelo declara sus propias relaciones en un método estático `associate`
Object.values(models).forEach((modelo) => {
  if (typeof modelo.associate === 'function') modelo.associate(models);
});

module.exports = models;
