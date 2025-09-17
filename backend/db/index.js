require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const mysql = require("mysql2/promise");
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: Number(process.env.DB_PORT || 3306),
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});

console.log("[DB]", {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  db: process.env.DB_NAME,
  hasPassword: !!process.env.DB_PASS,
});

module.exports = pool;
