import "dotenv/config";
import mysql from "mysql2/promise";
(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });
    const [r] = await conn.query("SELECT 1 AS ok");
    console.log("DB OK:", r);
    await conn.end();
  } catch (e) {
    console.error("DB FAIL:", e);
  }
})();
