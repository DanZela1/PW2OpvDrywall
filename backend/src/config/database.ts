import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';

dotenv.config();

// Las credenciales salen de .env; si faltan se usan los valores por defecto de XAMPP
const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '3306',
  DB_NAME = 'opv_drywall',
  DB_USER = 'root',
  DB_PASSWORD = '',
} = process.env;

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: 'mysql',
  logging: false,
  define: { underscored: true, charset: 'utf8mb4' },
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
});

// Crea la base de datos si no existe, así nadie tiene que crearla a mano en phpMyAdmin
export async function crearBaseSiNoExiste(): Promise<void> {
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
  });
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await conn.end();
}
