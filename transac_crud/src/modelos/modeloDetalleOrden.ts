import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import db from '../configuracion/db.js';
import { Orden } from './modeloOrden.js';

/*
 * MODELO "DETALLE ORDEN" (tabla hija: detalles_orden)
 * Representa cada producto que forma parte de una orden.
 * Es la tabla "hija" del CRUD transaccional: su llave foránea (ordenId)
 * apunta a la tabla "ordenes".
 */
export class DetalleOrden extends Model<
  InferAttributes<DetalleOrden>,
  InferCreationAttributes<DetalleOrden>
> {
  declare id: CreationOptional<number>;
  declare ordenId: number; // Llave foránea hacia ordenes.id
  declare producto: string;
  declare cantidad: number;
  declare precioUnitario: number;
  declare subtotal: number;
}

// Inicialización de la tabla
DetalleOrden.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ordenId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Orden, // Llave foránea hacia la tabla ordenes
        key: 'id',
      },
    },
    producto: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    precioUnitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get(this: DetalleOrden): number {
        return Number(this.getDataValue('precioUnitario'));
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false, // cantidad * precioUnitario, se calcula en el controlador
      get(this: DetalleOrden): number {
        return Number(this.getDataValue('subtotal'));
      },
    },
  },
  {
    sequelize: db,
    tableName: 'detalles_orden',
    timestamps: false, // Sin columnas createdAt y updatedAt
  }
);

export default DetalleOrden;
