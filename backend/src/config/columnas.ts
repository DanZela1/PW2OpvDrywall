import { DataTypes, DataType } from 'sequelize';
import { sequelize } from './database';
import { ESTADOS as ESTADOS_COTIZACION } from '../models/Cotizacion';

// sequelize.sync() crea tablas nuevas pero NO modifica las que ya existen.
// Esto pone al día las bases de datos creadas antes de cada cambio, así nadie tiene que
// ejecutar ALTER TABLE a mano. Si ya está actualizado, no hace nada.
interface ColumnaNueva {
  tabla: string;
  columna: string; // nombre real en la base (snake_case)
  tipo: DataType;
  referencia?: string; // tabla a la que apunta (llave foránea)
}

const COLUMNAS: ColumnaNueva[] = [
  { tabla: 'servicios', columna: 'imagen', tipo: DataTypes.STRING(255) },
  { tabla: 'servicios', columna: 'precio_base', tipo: DataTypes.DECIMAL(10, 2) },
  { tabla: 'postulaciones', columna: 'cv', tipo: DataTypes.STRING(255) },
  { tabla: 'cotizaciones', columna: 'subtotal', tipo: DataTypes.DECIMAL(12, 2) },
  { tabla: 'cotizaciones', columna: 'impuesto', tipo: DataTypes.DECIMAL(12, 2) },
  { tabla: 'cotizaciones', columna: 'total', tipo: DataTypes.DECIMAL(12, 2) },
  { tabla: 'cotizaciones', columna: 'cliente_id', tipo: DataTypes.INTEGER, referencia: 'clientes' },
];

export async function asegurarColumnas(): Promise<void> {
  const qi = sequelize.getQueryInterface();
  for (const { tabla, columna, tipo, referencia } of COLUMNAS) {
    const existentes = await qi.describeTable(tabla);
    if (!existentes[columna]) {
      await qi.addColumn(tabla, columna, {
        type: tipo,
        allowNull: true,
        ...(referencia && { references: { model: referencia, key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' }),
      });
      console.log(`Columna agregada: ${tabla}.${columna}`);
    }
  }

  // Los estados de cotización crecieron (en_revision, rechazada): se amplía el ENUM de la columna
  const cotizaciones = await qi.describeTable('cotizaciones');
  const tipoActual = String(cotizaciones.estado?.type ?? '');
  if (ESTADOS_COTIZACION.some((e) => !tipoActual.includes(`'${e}'`))) {
    const lista = ESTADOS_COTIZACION.map((e) => `'${e}'`).join(', ');
    await sequelize.query(
      `ALTER TABLE cotizaciones MODIFY COLUMN estado ENUM(${lista}) NOT NULL DEFAULT 'pendiente'`,
    );
    console.log('Columna actualizada: cotizaciones.estado (nuevos estados)');
  }
}
