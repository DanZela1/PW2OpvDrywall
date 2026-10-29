import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import type { Modelos } from './index';

export interface ServicioAtributos {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  contacto: string | null;
  activo: boolean;
  usuarioId?: number | null; // la agrega la relación con Usuario
}

type ServicioCreacion = Optional<ServicioAtributos, 'id' | 'contacto' | 'activo' | 'usuarioId'>;

export interface ServicioInstancia extends Model<ServicioAtributos, ServicioCreacion>, ServicioAtributos {}

const Servicio = sequelize.define<ServicioInstancia>(
  'Servicio',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
    categoria: { type: DataTypes.STRING(60), allowNull: false },
    contacto: { type: DataTypes.STRING(120), allowNull: true },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { tableName: 'servicios' },
);

// Relación: un usuario (administrador) crea muchos servicios
export function associate(models: Modelos): void {
  models.Usuario.hasMany(Servicio, {
    foreignKey: { name: 'usuarioId', allowNull: true },
    as: 'servicios',
    onDelete: 'SET NULL',
  });
  Servicio.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'creador' });
}

export default Servicio;
