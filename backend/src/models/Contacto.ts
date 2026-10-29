import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ContactoAtributos {
  id: number;
  nombre: string;
  correo: string;
  mensaje: string;
  leido: boolean;
}

type ContactoCreacion = Optional<ContactoAtributos, 'id' | 'leido'>;

export interface ContactoInstancia extends Model<ContactoAtributos, ContactoCreacion>, ContactoAtributos {}

const Contacto = sequelize.define<ContactoInstancia>(
  'Contacto',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    correo: { type: DataTypes.STRING(120), allowNull: false, validate: { isEmail: true } },
    mensaje: { type: DataTypes.TEXT, allowNull: false },
    leido: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  { tableName: 'contactos' },
);

export default Contacto;
