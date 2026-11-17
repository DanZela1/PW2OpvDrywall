import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Categorías para agrupar las fotos de la galería (la tabla de fotos la agrega el módulo de galería)
export interface CategoriaGaleriaAtributos {
  id: number;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
}

type CategoriaCreacion = Optional<CategoriaGaleriaAtributos, 'id' | 'descripcion' | 'activa'>;

export interface CategoriaGaleriaInstancia
  extends Model<CategoriaGaleriaAtributos, CategoriaCreacion>,
    CategoriaGaleriaAtributos {}

const CategoriaGaleria = sequelize.define<CategoriaGaleriaInstancia>(
  'CategoriaGaleria',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(60), allowNull: false, unique: true },
    descripcion: { type: DataTypes.STRING(255), allowNull: true },
    activa: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { tableName: 'categorias_galeria' },
);

export default CategoriaGaleria;
