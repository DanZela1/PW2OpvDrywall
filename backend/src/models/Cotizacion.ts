import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import type { Modelos } from './index';

export const ESTADOS = ['pendiente', 'en_revision', 'enviada', 'aceptada', 'rechazada'] as const;
export type EstadoCotizacion = (typeof ESTADOS)[number];

// Flujo permitido: desde cada estado, a cuáles se puede pasar (aceptada es final; rechazada se puede reabrir)
export const TRANSICIONES: Record<EstadoCotizacion, readonly EstadoCotizacion[]> = {
  pendiente: ['en_revision', 'enviada', 'rechazada'],
  en_revision: ['enviada', 'rechazada'],
  enviada: ['aceptada', 'rechazada'],
  aceptada: [],
  rechazada: ['pendiente'],
};

export interface CotizacionAtributos {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  tipoServicio: string;
  ubicacion: string;
  descripcion: string;
  estado: (typeof ESTADOS)[number];
  subtotal: number | null; // suma del detalle (null si la cotización aún no tiene detalle)
  impuesto: number | null;
  total: number | null;
  usuarioId?: number | null; // la agrega la relación con Usuario
  clienteId?: number | null; // la agrega la relación con Cliente
}

type CotizacionCreacion = Optional<CotizacionAtributos, 'id' | 'estado' | 'usuarioId' | 'clienteId' | 'subtotal' | 'impuesto' | 'total'>;

export interface CotizacionInstancia extends Model<CotizacionAtributos, CotizacionCreacion>, CotizacionAtributos {}

// DECIMAL llega como texto desde MySQL: se convierte a número (o null si no hay monto)
const monto = (campo: string) => ({
  type: DataTypes.DECIMAL(12, 2),
  allowNull: true,
  get(this: Model) {
    const v = this.getDataValue(campo as never) as unknown;
    return v === null || v === undefined ? null : Number(v);
  },
});

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
    subtotal: monto('subtotal'),
    impuesto: monto('impuesto'),
    total: monto('total'),
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
