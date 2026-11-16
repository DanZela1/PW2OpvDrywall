import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import type { Modelos } from './index';

export const TIPOS_ITEM = ['servicio', 'material', 'manual'] as const;
export type TipoItem = (typeof TIPOS_ITEM)[number];

const decimal = (campo: string) => ({
  type: DataTypes.DECIMAL(12, 2),
  allowNull: false,
  get(this: Model) {
    return Number(this.getDataValue(campo));
  },
});

// Cada línea de una cotización: un servicio, un material o un concepto escrito a mano.
// El precio unitario se COPIA aquí al cotizar, así un cambio de precios posterior no altera cotizaciones viejas.
export interface CotizacionDetalleAtributos {
  id: number;
  cotizacionId?: number;
  tipo: TipoItem;
  servicioId?: number | null;
  materialId?: number | null;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

type DetalleCreacion = Optional<CotizacionDetalleAtributos, 'id' | 'servicioId' | 'materialId'>;

export interface CotizacionDetalleInstancia
  extends Model<CotizacionDetalleAtributos, DetalleCreacion>,
    CotizacionDetalleAtributos {}

const CotizacionDetalle = sequelize.define<CotizacionDetalleInstancia>(
  'CotizacionDetalle',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tipo: { type: DataTypes.ENUM(...TIPOS_ITEM), allowNull: false },
    descripcion: { type: DataTypes.STRING(200), allowNull: false },
    cantidad: decimal('cantidad'),
    precioUnitario: decimal('precioUnitario'),
    subtotal: decimal('subtotal'),
  },
  { tableName: 'cotizacion_detalle' },
);

export function associate(models: Modelos): void {
  models.Cotizacion.hasMany(CotizacionDetalle, {
    foreignKey: { name: 'cotizacionId', allowNull: false },
    as: 'detalle',
    onDelete: 'CASCADE',
  });
  CotizacionDetalle.belongsTo(models.Cotizacion, { foreignKey: 'cotizacionId', as: 'cotizacion' });
  CotizacionDetalle.belongsTo(models.Servicio, { foreignKey: { name: 'servicioId', allowNull: true }, as: 'servicio', onDelete: 'SET NULL' });
  CotizacionDetalle.belongsTo(models.Material, { foreignKey: { name: 'materialId', allowNull: true }, as: 'material', onDelete: 'SET NULL' });
}

export default CotizacionDetalle;
