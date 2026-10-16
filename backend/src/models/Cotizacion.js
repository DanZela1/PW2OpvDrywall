const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ESTADOS = ['pendiente', 'enviada', 'aceptada'];

const Cotizacion = sequelize.define('Cotizacion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  correo: { type: DataTypes.STRING(120), allowNull: false, validate: { isEmail: true } },
  telefono: { type: DataTypes.STRING(10), allowNull: false },
  tipoServicio: { type: DataTypes.STRING(100), allowNull: false },
  ubicacion: { type: DataTypes.STRING(150), allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: false },
  estado: { type: DataTypes.ENUM(...ESTADOS), allowNull: false, defaultValue: 'pendiente' },
}, { tableName: 'cotizaciones' });

// Un usuario (cliente) tiene muchas cotizaciones; si se borra el usuario, la cotización se conserva sin dueño
Cotizacion.associate = (models) => {
  models.Usuario.hasMany(Cotizacion, { foreignKey: { name: 'usuarioId', allowNull: true }, as: 'cotizaciones', onDelete: 'SET NULL' });
  Cotizacion.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
};

Cotizacion.ESTADOS = ESTADOS;
module.exports = Cotizacion;
