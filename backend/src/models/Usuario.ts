import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface UsuarioAtributos {
  id: number;
  nombre: string;
  correo: string;
  passwordHash: string;
  rol: 'admin' | 'cliente';
}

type UsuarioCreacion = Optional<UsuarioAtributos, 'id' | 'rol'>;

export interface UsuarioInstancia extends Model<UsuarioAtributos, UsuarioCreacion>, UsuarioAtributos {}

const Usuario = sequelize.define<UsuarioInstancia>(
  'Usuario',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    correo: { type: DataTypes.STRING(120), allowNull: false, unique: true, validate: { isEmail: true } },
    passwordHash: { type: DataTypes.STRING(100), allowNull: false },
    rol: { type: DataTypes.ENUM('admin', 'cliente'), allowNull: false, defaultValue: 'cliente' },
  },
  {
    tableName: 'usuarios',
    // El hash de la contraseña nunca sale en las consultas normales
    defaultScope: { attributes: { exclude: ['passwordHash'] } },
  },
);

export default Usuario;
