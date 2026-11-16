import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import type { Modelos } from './index';

// Persona o empresa que pide cotizaciones. Se identifica por su correo (único):
// si pide otra cotización con el mismo correo, se reutiliza el mismo cliente.
export interface ClienteAtributos {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string | null;
  notas: string | null;
}

type ClienteCreacion = Optional<ClienteAtributos, 'id' | 'direccion' | 'notas'>;

export interface ClienteInstancia extends Model<ClienteAtributos, ClienteCreacion>, ClienteAtributos {}

const Cliente = sequelize.define<ClienteInstancia>(
  'Cliente',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    correo: { type: DataTypes.STRING(120), allowNull: false, unique: true, validate: { isEmail: true } },
    telefono: { type: DataTypes.STRING(10), allowNull: false },
    direccion: { type: DataTypes.STRING(150), allowNull: true },
    notas: { type: DataTypes.TEXT, allowNull: true },
  },
  { tableName: 'clientes' },
);

// Un cliente tiene muchas cotizaciones (si se borra el cliente, quedan sin cliente)
export function associate(models: Modelos): void {
  Cliente.hasMany(models.Cotizacion, {
    foreignKey: { name: 'clienteId', allowNull: true },
    as: 'cotizaciones',
    onDelete: 'SET NULL',
  });
  models.Cotizacion.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });
}

export default Cliente;
