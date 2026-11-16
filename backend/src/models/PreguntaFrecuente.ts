import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PreguntaFrecuenteAtributos {
  id: number;
  pregunta: string;
  respuesta: string;
  orden: number; // las preguntas se muestran de menor a mayor
  activo: boolean;
}

type PreguntaCreacion = Optional<PreguntaFrecuenteAtributos, 'id' | 'orden' | 'activo'>;

export interface PreguntaFrecuenteInstancia
  extends Model<PreguntaFrecuenteAtributos, PreguntaCreacion>,
    PreguntaFrecuenteAtributos {}

const PreguntaFrecuente = sequelize.define<PreguntaFrecuenteInstancia>(
  'PreguntaFrecuente',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pregunta: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    respuesta: { type: DataTypes.TEXT, allowNull: false },
    orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { tableName: 'preguntas_frecuentes' },
);

export default PreguntaFrecuente;
