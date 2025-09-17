require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

console.log("[REVIEW DATASET INIT] Starting database initialization...");

// Create pool without specific database for initial setup
const poolWithoutDB = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: Number(process.env.DB_PORT || 3306),
  password: process.env.DB_PASS,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});

// Pool for review_dataset database
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: Number(process.env.DB_PORT || 3306),
  password: process.env.DB_PASS,
  database: "review_dataset",
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});

async function runSqlFile(filePath) {
  console.log(`📁 Reading SQL file: ${filePath}`);
  const sql = fs.readFileSync(filePath, "utf8");

  // Split by semicolon and filter empty statements
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((stmt) => !stmt.startsWith("--") && !stmt.startsWith("/*"));

  console.log(`📝 Found ${statements.length} SQL statements to execute`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (stmt && stmt.length > 10) {
      // Skip very short statements
      try {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        await pool.query(stmt);
      } catch (err) {
        console.error(
          `❌ Error in statement ${i + 1}:`,
          stmt.slice(0, 100) + "..."
        );
        console.error("Error:", err.message);
        // Continue with other statements
      }
    }
  }
}

async function testDatabase() {
  try {
    console.log("\n🧪 Testing database structure...");

    // Check if database exists
    const [dbs] = await poolWithoutDB.query(
      "SHOW DATABASES LIKE 'review_dataset'"
    );
    if (dbs.length === 0) {
      throw new Error("Database 'review_dataset' was not created");
    }
    console.log("✅ Database 'review_dataset' exists");

    // Check tables
    const [tables] = await pool.query("SHOW TABLES");
    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach((row, index) => {
      const tableName = Object.values(row)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });

    // Check main table structure
    const [reviewsColumns] = await pool.query("DESCRIBE reviews_raw");
    console.log(`✅ reviews_raw table has ${reviewsColumns.length} columns`);

    const [placesColumns] = await pool.query("DESCRIBE places_meta_dataset");
    console.log(
      `✅ places_meta_dataset table has ${placesColumns.length} columns`
    );

    // Check if sample data sources were inserted
    const [sources] = await pool.query(
      "SELECT COUNT(*) as count FROM data_sources"
    );
    console.log(`✅ data_sources table has ${sources[0].count} sample records`);

    // Test insert capability
    console.log("\n🧪 Testing insert capability...");
    const testInsert = await pool.execute(
      `
      INSERT INTO reviews_raw (
        place_id, place_name, address, avg_rating, total_review,
        reviewer, review_rating, review_text, review_time, source, batch_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        "test_place_001",
        "Test Restaurant",
        "123 Test Street, Test City",
        4.5,
        100,
        "Test Reviewer",
        5,
        "This is a test review with emojis 🍕🍔🍟 and unicode characters áêíôú",
        "2025-09-09T10:00:00Z",
        "Manual",
        1,
      ]
    );

    console.log(`✅ Test insert successful, ID: ${testInsert[0].insertId}`);

    // Clean up test data
    await pool.execute(
      "DELETE FROM reviews_raw WHERE place_id = 'test_place_001'"
    );
    console.log("✅ Test data cleaned up");

    console.log("\n🎉 Database initialization completed successfully!");
    console.log(
      "📊 Review dataset database is ready for large-scale data import"
    );
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
    throw error;
  }
}

(async () => {
  try {
    // Create database
    console.log("🏗️  Creating review_dataset database...");
    await poolWithoutDB.query(
      "CREATE DATABASE IF NOT EXISTS review_dataset CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    );
    console.log("✅ Database created/exists");

    // Run schema file
    const sqlPath = path.resolve(
      __dirname,
      "../../sql/review_dataset_simple.sql"
    );
    await runSqlFile(sqlPath);
    console.log("✅ Schema initialized");

    // Test database
    await testDatabase();

    process.exit(0);
  } catch (err) {
    console.error(
      "❌ Failed to initialize review dataset database:",
      err.message
    );
    process.exit(1);
  } finally {
    await poolWithoutDB.end();
    await pool.end();
  }
})();
