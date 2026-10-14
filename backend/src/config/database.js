require('dotenv').config();
const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

// Todas las credenciales vienen de variables de entorno (.env), nunca del código
const { DB_HOST = '127.0.0.1', DB_PORT = 3306, DB_NAME = 'opv_drywall', DB_USER = 'root', DB_PASSWORD = '' } = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: 'mysql',
  logging: false,
  define: { underscored: true, charset: 'utf8mb4' },
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
});

// Crea la base de datos si todavía no existe (evita un paso manual)
async function crearBaseSiNoExiste() {
  const conn = await mysql.createConnection({ host: DB_HOST, port: Number(DB_PORT), user: DB_USER, password: DB_PASSWORD });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.end();
}

module.exports = { sequelize, crearBaseSiNoExiste };
