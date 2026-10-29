const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ESTADOS = ['nueva', 'revisada', 'aceptada', 'rechazada'];

const Postulacion = sequelize.define('Postulacion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  correo: { type: DataTypes.STRING(120), allowNull: false, validate: { isEmail: true } },
  telefono: { type: DataTypes.STRING(10), allowNull: false },
  experiencia: { type: DataTypes.TEXT, allowNull: true },
  estado: { type: DataTypes.ENUM(...ESTADOS), allowNull: false, defaultValue: 'nueva' },
}, { tableName: 'postulaciones' });

Postulacion.ESTADOS = ESTADOS;
module.exports = Postulacion;
