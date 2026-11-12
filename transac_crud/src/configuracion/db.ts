import 'dotenv/config';
import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';

/*
 * CONFIGURACIÓN MÍNIMA DE SEQUELIZE
 * Las credenciales se leen del archivo .env (copia .env.example a .env).
 * Sobre esta instancia ("db") se ejecutan las transacciones: db.transaction(...)
 */
const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'transac_crud',
} = process.env;

const db = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: 'mysql',
  logging: false, // Cambiar a console.log para ver el SQL (incluye START TRANSACTION, COMMIT y ROLLBACK)
});

// Crea la base de datos si no existe, así no hay que crearla a mano en phpMyAdmin / Workbench
export const crearBaseSiNoExiste = async (): Promise<void> => {
  const conexion = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
  });
  await conexion.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  await conexion.end();
};

export default db;
