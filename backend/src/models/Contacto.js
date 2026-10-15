const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Contacto = sequelize.define('Contacto', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  correo: { type: DataTypes.STRING(120), allowNull: false, validate: { isEmail: true } },
  mensaje: { type: DataTypes.TEXT, allowNull: false },
  leido: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { tableName: 'contactos' });

module.exports = Contacto;
