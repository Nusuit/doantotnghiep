require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const mysql = require("mysql2/promise");

// Create pool directly to avoid cache issues
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

async function attachDefaultRole(userId) {
  // Gán role user mặc định cho user mới (key = 'user', không phải 'USER')
  await pool.execute(
    "INSERT INTO user_roles (user_id, role_id) SELECT ?, id FROM roles WHERE `key` = ? LIMIT 1",
    [userId, "user"]
  );
}

async function getUserRoles(userId) {
  const [rows] = await pool.query(
    "SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?",
    [userId]
  );
  return rows.map((r) => r.name);
}

module.exports = { attachDefaultRole, getUserRoles };
