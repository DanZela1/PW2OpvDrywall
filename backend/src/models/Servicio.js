const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Servicio = sequelize.define('Servicio', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  descripcion: { type: DataTypes.TEXT, allowNull: false },
  categoria: { type: DataTypes.STRING(60), allowNull: false },
  contacto: { type: DataTypes.STRING(120), allowNull: true },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { tableName: 'servicios' });

// Un usuario (admin / negocio) publica muchos servicios
Servicio.associate = (models) => {
  models.Usuario.hasMany(Servicio, { foreignKey: { name: 'usuarioId', allowNull: true }, as: 'servicios', onDelete: 'SET NULL' });
  Servicio.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'creador' });
};

module.exports = Servicio;
