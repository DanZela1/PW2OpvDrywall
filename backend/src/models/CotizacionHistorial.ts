import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import type { Modelos } from './index';

// Bitácora de una cotización: cada cambio de estado deja una fila (quién, cuándo, de qué a qué).
export interface CotizacionHistorialAtributos {
  id: number;
  cotizacionId?: number; // la agrega la relación con Cotizacion
  estadoAnterior: string | null; // null en la fila inicial (cuando se crea la cotización)
  estadoNuevo: string;
  comentario: string | null;
  usuarioId?: number | null; // admin que hizo el cambio (null si la creó un visitante); la agrega la relación con Usuario
}

type HistorialCreacion = Optional<CotizacionHistorialAtributos, 'id' | 'estadoAnterior' | 'comentario'>;

export interface CotizacionHistorialInstancia
  extends Model<CotizacionHistorialAtributos, HistorialCreacion>,
    CotizacionHistorialAtributos {}

const CotizacionHistorial = sequelize.define<CotizacionHistorialInstancia>(
  'CotizacionHistorial',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    estadoAnterior: { type: DataTypes.STRING(20), allowNull: true },
    estadoNuevo: { type: DataTypes.STRING(20), allowNull: false },
    comentario: { type: DataTypes.STRING(500), allowNull: true },
  },
  { tableName: 'cotizacion_historial' },
);

// Si se borra la cotización se borra su historial; si se borra el usuario, queda sin autor
export function associate(models: Modelos): void {
  models.Cotizacion.hasMany(CotizacionHistorial, {
    foreignKey: { name: 'cotizacionId', allowNull: false },
    as: 'historial',
    onDelete: 'CASCADE',
  });
  CotizacionHistorial.belongsTo(models.Cotizacion, { foreignKey: 'cotizacionId', as: 'cotizacion' });
  CotizacionHistorial.belongsTo(models.Usuario, {
    foreignKey: { name: 'usuarioId', allowNull: true },
    as: 'autor',
    onDelete: 'SET NULL',
  });
}

export default CotizacionHistorial;
