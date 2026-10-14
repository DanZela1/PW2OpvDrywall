const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  correo: { type: DataTypes.STRING(120), allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING(100), allowNull: false },
  rol: { type: DataTypes.ENUM('admin', 'cliente'), allowNull: false, defaultValue: 'cliente' },
}, {
  tableName: 'usuarios',
  // El hash nunca sale en las respuestas; para el login se usa Usuario.unscoped()
  defaultScope: { attributes: { exclude: ['passwordHash'] } },
});

module.exports = Usuario;
