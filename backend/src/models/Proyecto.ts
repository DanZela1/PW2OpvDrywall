import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import type { Modelos } from './index';

export const ESTADOS = ['Cotización enviada', 'En ejecución', 'Finalizado'] as const;

export interface ProyectoAtributos {
  id: number;
  codigo: string;
  clienteCorreo: string;
  estado: (typeof ESTADOS)[number];
  notas: string | null;
  cotizacionId?: number | null; // la agrega la relación con Cotización
}

type ProyectoCreacion = Optional<ProyectoAtributos, 'id' | 'estado' | 'notas' | 'cotizacionId'>;

export interface ProyectoInstancia extends Model<ProyectoAtributos, ProyectoCreacion>, ProyectoAtributos {}

const Proyecto = sequelize.define<ProyectoInstancia>(
  'Proyecto',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    codigo: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    clienteCorreo: { type: DataTypes.STRING(120), allowNull: false, validate: { isEmail: true } },
    estado: { type: DataTypes.ENUM(...ESTADOS), allowNull: false, defaultValue: 'Cotización enviada' },
    notas: { type: DataTypes.TEXT, allowNull: true },
  },
  { tableName: 'proyectos' },
);

// Relación 1 a 1: una cotización genera como máximo un proyecto (cotizacionId es único)
export function associate(models: Modelos): void {
  models.Cotizacion.hasOne(Proyecto, {
    foreignKey: { name: 'cotizacionId', allowNull: true, unique: true },
    as: 'proyecto',
    onDelete: 'SET NULL',
  });
  Proyecto.belongsTo(models.Cotizacion, { foreignKey: 'cotizacionId', as: 'cotizacion' });
}

export default Proyecto;
