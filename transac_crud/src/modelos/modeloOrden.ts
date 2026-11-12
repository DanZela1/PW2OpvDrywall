import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import db from '../configuracion/db.js';

/*
 * MODELO "ORDEN" (tabla cabecera: ordenes)
 * Representa una orden de compra de material escolar.
 * Es la tabla "padre" del CRUD transaccional: cada orden puede tener
 * muchos detalles (productos) en la tabla "detalles_orden".
 */
export class Orden extends Model<
  InferAttributes<Orden>,
  InferCreationAttributes<Orden>
> {
  declare id: CreationOptional<number>;
  declare numeroOrden: string;
  declare clienteNombre: string;
  declare observaciones: string | null;
  declare total: CreationOptional<number>;
  declare estado: CreationOptional<boolean>;
}

// Inicialización de la tabla
Orden.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numeroOrden: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true, // No pueden existir dos órdenes con el mismo número
    },
    clienteNombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0, // Se recalcula dentro de la transacción con la suma de los subtotales
      // MySQL devuelve los DECIMAL como texto ("1505.00"); este getter los entrega como número
      get(this: Orden): number {
        return Number(this.getDataValue('total'));
      },
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    sequelize: db,
    tableName: 'ordenes',
    timestamps: false, // Sin columnas createdAt y updatedAt
  }
);

export default Orden;
