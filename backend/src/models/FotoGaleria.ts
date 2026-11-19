import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import type { Modelos } from './index';

// Fotos de trabajos realizados; cada una pertenece a una categoría de galería
export interface FotoGaleriaAtributos {
  id: number;
  titulo: string;
  descripcion: string | null;
  imagen: string; // ruta pública, ej. /uploads/imagenes/123-ab.jpg
  activa: boolean;
  categoriaId?: number | null; // la agrega la relación con CategoriaGaleria
}

type FotoCreacion = Optional<FotoGaleriaAtributos, 'id' | 'descripcion' | 'activa' | 'categoriaId'>;

export interface FotoGaleriaInstancia extends Model<FotoGaleriaAtributos, FotoCreacion>, FotoGaleriaAtributos {}

const FotoGaleria = sequelize.define<FotoGaleriaInstancia>(
  'FotoGaleria',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    titulo: { type: DataTypes.STRING(100), allowNull: false },
    descripcion: { type: DataTypes.STRING(255), allowNull: true },
    imagen: { type: DataTypes.STRING(255), allowNull: false },
    activa: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { tableName: 'fotos_galeria' },
);

// Relación: una categoría agrupa muchas fotos. Si se elimina la categoría, sus fotos quedan sin categoría.
export function associate(models: Modelos): void {
  models.CategoriaGaleria.hasMany(FotoGaleria, {
    foreignKey: { name: 'categoriaId', allowNull: true },
    as: 'fotos',
    onDelete: 'SET NULL',
  });
  FotoGaleria.belongsTo(models.CategoriaGaleria, { foreignKey: 'categoriaId', as: 'categoria' });
}

export default FotoGaleria;
