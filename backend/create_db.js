require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '12345'
  });
  
  const dbName = process.env.DB_NAME || 'renthouse';
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  console.log(`Database '${dbName}' created or already exists.`);
  await connection.end();
}

main().catch(err => {
  console.error("Failed to create database:", err);
  process.exit(1);
});
