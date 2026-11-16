import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Un testimonio enviado desde el sitio queda "pendiente" hasta que un administrador lo aprueba
export const ESTADOS = ['pendiente', 'aprobado', 'rechazado'] as const;

export interface TestimonioAtributos {
  id: number;
  nombre: string;
  rol: string | null; // ej. "Propietaria de vivienda"
  texto: string;
  calificacion: number | null; // 1 a 5
  foto: string | null; // ruta pública, ej. /uploads/testimonios/123-ab.jpg
  correo: string | null; // privado: solo lo ve el administrador
  estado: (typeof ESTADOS)[number];
}

type TestimonioCreacion = Optional<TestimonioAtributos, 'id' | 'rol' | 'calificacion' | 'foto' | 'correo' | 'estado'>;

export interface TestimonioInstancia extends Model<TestimonioAtributos, TestimonioCreacion>, TestimonioAtributos {}

const Testimonio = sequelize.define<TestimonioInstancia>(
  'Testimonio',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    rol: { type: DataTypes.STRING(100), allowNull: true },
    texto: { type: DataTypes.TEXT, allowNull: false },
    calificacion: { type: DataTypes.INTEGER, allowNull: true, validate: { min: 1, max: 5 } },
    foto: { type: DataTypes.STRING(255), allowNull: true },
    correo: { type: DataTypes.STRING(120), allowNull: true, validate: { isEmail: true } },
    estado: { type: DataTypes.ENUM(...ESTADOS), allowNull: false, defaultValue: 'pendiente' },
  },
  { tableName: 'testimonios' },
);

export default Testimonio;
