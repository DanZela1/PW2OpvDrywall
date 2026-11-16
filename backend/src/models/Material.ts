import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Catálogo de materiales con precio de lista; se usa para armar el detalle de las cotizaciones.
export interface MaterialAtributos {
  id: number;
  nombre: string;
  unidad: string; // plancha, saco, metro, pieza...
  precioUnitario: number;
  activo: boolean;
}

type MaterialCreacion = Optional<MaterialAtributos, 'id' | 'activo'>;

export interface MaterialInstancia extends Model<MaterialAtributos, MaterialCreacion>, MaterialAtributos {}

const Material = sequelize.define<MaterialInstancia>(
  'Material',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    unidad: { type: DataTypes.STRING(30), allowNull: false },
    precioUnitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      // MySQL devuelve los DECIMAL como texto; aquí se convierten a número
      get(this: MaterialInstancia) {
        return Number(this.getDataValue('precioUnitario'));
      },
    },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { tableName: 'materiales' },
);

export default Material;
