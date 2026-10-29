const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ESTADOS = ['Cotización enviada', 'En ejecución', 'Finalizado'];

// Seguimiento de proyectos (PB-07): el cliente consulta con correo + código
const Proyecto = sequelize.define('Proyecto', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  clienteCorreo: { type: DataTypes.STRING(120), allowNull: false, validate: { isEmail: true } },
  estado: { type: DataTypes.ENUM(...ESTADOS), allowNull: false, defaultValue: 'Cotización enviada' },
  notas: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'proyectos' });

// Una cotización origina (como máximo) un proyecto con seguimiento
Proyecto.associate = (models) => {
  models.Cotizacion.hasOne(Proyecto, { foreignKey: { name: 'cotizacionId', allowNull: true, unique: true }, as: 'proyecto', onDelete: 'SET NULL' });
  Proyecto.belongsTo(models.Cotizacion, { foreignKey: 'cotizacionId', as: 'cotizacion' });
};

Proyecto.ESTADOS = ESTADOS;
module.exports = Proyecto;
