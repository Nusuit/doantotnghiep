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

(async () => {
  try {
    console.log("🔍 Checking database tables...");

    const [tables] = await pool.query("SHOW TABLES");

    console.log(
      `\n✅ Found ${tables.length} tables in database '${process.env.DB_NAME}':`
    );
    tables.forEach((row, index) => {
      const tableName = Object.values(row)[0];
      console.log(`${index + 1}. ${tableName}`);
    });

    // Test một vài bảng quan trọng
    const criticalTables = ["users", "roles", "user_roles", "refresh_tokens"];
    console.log("\n🧪 Testing critical tables structure:");

    for (const tableName of criticalTables) {
      try {
        const [columns] = await pool.query(`DESCRIBE ${tableName}`);
        console.log(`\n📋 Table '${tableName}' (${columns.length} columns):`);
        columns.forEach((col) => {
          console.log(
            `  - ${col.Field}: ${col.Type} ${
              col.Null === "NO" ? "NOT NULL" : ""
            } ${col.Key ? `[${col.Key}]` : ""}`
          );
        });
      } catch (err) {
        console.error(`❌ Error checking table '${tableName}':`, err.message);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Database test failed:", err.message);
    process.exit(1);
  }
})();
