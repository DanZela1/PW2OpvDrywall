import { DataTypes } from 'sequelize';
import { sequelize } from './database';

// sequelize.sync() crea tablas nuevas pero NO agrega columnas a tablas que ya existen.
// Esto agrega las columnas de archivos a las bases de datos creadas antes de esta función,
// así nadie tiene que ejecutar ALTER TABLE a mano. Si la columna ya existe, no hace nada.
const COLUMNAS = [
  { tabla: 'servicios', columna: 'imagen' },
  { tabla: 'postulaciones', columna: 'cv' },
];

export async function asegurarColumnas(): Promise<void> {
  const qi = sequelize.getQueryInterface();
  for (const { tabla, columna } of COLUMNAS) {
    const existentes = await qi.describeTable(tabla);
    if (!existentes[columna]) {
      await qi.addColumn(tabla, columna, { type: DataTypes.STRING(255), allowNull: true });
      console.log(`Columna agregada: ${tabla}.${columna}`);
    }
  }
}
