import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export const ESTADOS = ['nueva', 'revisada', 'aceptada', 'rechazada'] as const;

export interface PostulacionAtributos {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  experiencia: string | null;
  cv: string | null; // nombre del archivo guardado en uploads/cv (privado)
  cvUrl?: string | null; // campo virtual: ruta de descarga para administradores
  estado: (typeof ESTADOS)[number];
}

type PostulacionCreacion = Optional<PostulacionAtributos, 'id' | 'experiencia' | 'cv' | 'cvUrl' | 'estado'>;

export interface PostulacionInstancia extends Model<PostulacionAtributos, PostulacionCreacion>, PostulacionAtributos {}

const Postulacion = sequelize.define<PostulacionInstancia>(
  'Postulacion',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    correo: { type: DataTypes.STRING(120), allowNull: false, validate: { isEmail: true } },
    telefono: { type: DataTypes.STRING(10), allowNull: false },
    experiencia: { type: DataTypes.TEXT, allowNull: true },
    cv: { type: DataTypes.STRING(255), allowNull: true },
    cvUrl: {
      type: DataTypes.VIRTUAL,
      get(this: PostulacionInstancia) {
        return this.getDataValue('cv') ? `/api/postulaciones/${this.getDataValue('id')}/cv` : null;
      },
    },
    estado: { type: DataTypes.ENUM(...ESTADOS), allowNull: false, defaultValue: 'nueva' },
  },
  { tableName: 'postulaciones' },
);

export default Postulacion;
