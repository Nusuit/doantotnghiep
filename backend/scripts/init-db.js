require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
console.log(
  "[ENV]",
  process.env.DB_USER,
  process.env.DB_PASS,
  process.env.DB_HOST,
  process.env.DB_NAME
);
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

// Tạo pool trực tiếp thay vì require('../db')
const poolWithoutDB = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: Number(process.env.DB_PORT || 3306),
  password: process.env.DB_PASS,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});

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

async function runSqlFile(filePath) {
  const sql = fs.readFileSync(filePath, "utf8");
  // Split by semicolon, filter empty, and run each statement
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const stmt of statements) {
    if (stmt) {
      try {
        await pool.query(stmt);
      } catch (err) {
        console.error(
          "Error running statement:",
          stmt.slice(0, 100),
          err.message
        );
      }
    }
  }
}

(async () => {
  try {
    // Tạo database trước
    console.log(`Creating database '${process.env.DB_NAME}' if not exists...`);
    await poolWithoutDB.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log("✓ Database created/exists");

    // Chạy schema
    const sqlPath = path.resolve(__dirname, "../../sql/schema.sql");
    await runSqlFile(sqlPath);
    console.log("Database schema initialized!");
    process.exit(0);
  } catch (err) {
    console.error("Failed to initialize DB:", err);
    process.exit(1);
  }
})();
