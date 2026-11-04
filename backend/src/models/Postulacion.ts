import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export const ESTADOS = ['nueva', 'revisada', 'aceptada', 'rechazada'] as const;

export interface PostulacionAtributos {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  experiencia: string | null;
  estado: (typeof ESTADOS)[number];
}

type PostulacionCreacion = Optional<PostulacionAtributos, 'id' | 'experiencia' | 'estado'>;

export interface PostulacionInstancia extends Model<PostulacionAtributos, PostulacionCreacion>, PostulacionAtributos {}

const Postulacion = sequelize.define<PostulacionInstancia>(
  'Postulacion',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    correo: { type: DataTypes.STRING(120), allowNull: false, validate: { isEmail: true } },
    telefono: { type: DataTypes.STRING(10), allowNull: false },
    experiencia: { type: DataTypes.TEXT, allowNull: true },
    estado: { type: DataTypes.ENUM(...ESTADOS), allowNull: false, defaultValue: 'nueva' },
  },
  { tableName: 'postulaciones' },
);

export default Postulacion;
