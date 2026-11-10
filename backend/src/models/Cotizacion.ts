import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import type { Modelos } from './index';

export const ESTADOS = ['pendiente', 'enviada', 'aceptada'] as const;

export interface CotizacionAtributos {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  tipoServicio: string;
  ubicacion: string;
  descripcion: string;
  estado: (typeof ESTADOS)[number];
  usuarioId?: number | null; // la agrega la relación con Usuario
}

type CotizacionCreacion = Optional<CotizacionAtributos, 'id' | 'estado' | 'usuarioId'>;

export interface CotizacionInstancia extends Model<CotizacionAtributos, CotizacionCreacion>, CotizacionAtributos {}

const Cotizacion = sequelize.define<CotizacionInstancia>(
  'Cotizacion',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    correo: { type: DataTypes.STRING(120), allowNull: false, validate: { isEmail: true } },
    telefono: { type: DataTypes.STRING(10), allowNull: false },
    tipoServicio: { type: DataTypes.STRING(100), allowNull: false },
    ubicacion: { type: DataTypes.STRING(150), allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
    estado: { type: DataTypes.ENUM(...ESTADOS), allowNull: false, defaultValue: 'pendiente' },
  },
  { tableName: 'cotizaciones' },
);

// Relaciones: un usuario tiene muchas cotizaciones (si se borra el usuario, usuarioId queda en NULL)
export function associate(models: Modelos): void {
  models.Usuario.hasMany(Cotizacion, {
    foreignKey: { name: 'usuarioId', allowNull: true },
    as: 'cotizaciones',
    onDelete: 'SET NULL',
  });
  Cotizacion.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
}

export default Cotizacion;
