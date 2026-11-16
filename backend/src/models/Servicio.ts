import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import type { Modelos } from './index';

export interface ServicioAtributos {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  contacto: string | null;
  imagen: string | null; // ruta pública, ej. /uploads/imagenes/123-ab.jpg
  precioBase: number | null; // precio de referencia para cotizar (solo lo ve el admin)
  activo: boolean;
  usuarioId?: number | null; // la agrega la relación con Usuario
}

type ServicioCreacion = Optional<ServicioAtributos, 'id' | 'contacto' | 'imagen' | 'precioBase' | 'activo' | 'usuarioId'>;

export interface ServicioInstancia extends Model<ServicioAtributos, ServicioCreacion>, ServicioAtributos {}

const Servicio = sequelize.define<ServicioInstancia>(
  'Servicio',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
    categoria: { type: DataTypes.STRING(60), allowNull: false },
    contacto: { type: DataTypes.STRING(120), allowNull: true },
    imagen: { type: DataTypes.STRING(255), allowNull: true },
    precioBase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      get(this: ServicioInstancia) {
        const v = this.getDataValue('precioBase') as unknown;
        return v === null || v === undefined ? null : Number(v);
      },
    },
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
