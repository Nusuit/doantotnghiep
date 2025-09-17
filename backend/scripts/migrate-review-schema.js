require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

console.log("🔄 Starting Review Dataset Schema Migration...");

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

async function runMigrationStep(stepName, sql) {
  console.log(`\n🔧 ${stepName}...`);
  try {
    await pool.query(sql);
    console.log(`✅ ${stepName} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${stepName} failed:`, error.message);
    return false;
  }
}

async function validateTableStructure() {
  console.log("\n🔍 Validating new table structure...");

  try {
    // Check table structure
    const [columns] = await pool.query("DESCRIBE reviews_raw");
    console.log(`📋 reviews_raw table structure (${columns.length} columns):`);

    const expectedColumns = [
      "id",
      "place_id",
      "name",
      "address",
      "country",
      "rating",
      "user_ratings_total",
      "review_author",
      "review_rating",
      "review_text",
      "review_time",
      "source",
      "crawltime",
    ];

    const actualColumns = columns.map((col) => col.Field);

    expectedColumns.forEach((expected) => {
      const exists = actualColumns.includes(expected);
      console.log(
        `   ${exists ? "✅" : "❌"} ${expected}: ${
          exists ? "EXISTS" : "MISSING"
        }`
      );
    });

    // Check indexes
    const [indexes] = await pool.query("SHOW INDEX FROM reviews_raw");
    console.log(
      `\n📊 Indexes (${
        indexes.filter((idx) => idx.Key_name !== "PRIMARY").length
      } non-primary indexes):`
    );

    const indexNames = [...new Set(indexes.map((idx) => idx.Key_name))].filter(
      (name) => name !== "PRIMARY"
    );
    indexNames.forEach((indexName) => {
      console.log(`   ✅ ${indexName}`);
    });

    return true;
  } catch (error) {
    console.error("❌ Structure validation failed:", error.message);
    return false;
  }
}

async function validateDataIntegrity() {
  console.log("\n🧪 Validating data integrity...");

  try {
    // Basic counts
    const [counts] = await pool.query(`
      SELECT 
        COUNT(*) as total_reviews,
        COUNT(DISTINCT place_id) as unique_places,
        COUNT(DISTINCT source) as unique_sources,
        COUNT(DISTINCT country) as unique_countries
      FROM reviews_raw
    `);

    console.log("📊 Data Summary:");
    console.log(`   Total Reviews: ${counts[0].total_reviews}`);
    console.log(`   Unique Places: ${counts[0].unique_places}`);
    console.log(`   Unique Sources: ${counts[0].unique_sources}`);
    console.log(`   Unique Countries: ${counts[0].unique_countries}`);

    // Source distribution
    const [sources] = await pool.query(`
      SELECT source, COUNT(*) as count 
      FROM reviews_raw 
      GROUP BY source 
      ORDER BY count DESC
    `);

    console.log("\n📈 Source Distribution:");
    sources.forEach((row) => {
      console.log(`   ${row.source}: ${row.count} reviews`);
    });

    // Country distribution
    const [countries] = await pool.query(`
      SELECT country, COUNT(*) as count 
      FROM reviews_raw 
      WHERE country IS NOT NULL
      GROUP BY country 
      ORDER BY count DESC
    `);

    console.log("\n🌍 Country Distribution:");
    countries.forEach((row) => {
      console.log(`   ${row.country}: ${row.count} reviews`);
    });

    // Sample data check
    const [samples] = await pool.query(`
      SELECT 
        place_id, name, address, country, rating, user_ratings_total,
        review_author, review_rating, LEFT(review_text, 50) as review_excerpt,
        review_time, source, crawltime
      FROM reviews_raw 
      LIMIT 3
    `);

    console.log("\n📋 Sample Data:");
    samples.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.name} (${row.source})`);
      console.log(
        `      Place: ${row.place_id} | Rating: ${row.rating}⭐ (${row.user_ratings_total} total)`
      );
      console.log(
        `      Review: ${row.review_rating}⭐ by ${row.review_author}`
      );
      console.log(`      Text: "${row.review_excerpt}..."`);
      console.log(`      Location: ${row.address}, ${row.country}`);
    });

    return true;
  } catch (error) {
    console.error("❌ Data validation failed:", error.message);
    return false;
  }
}

async function performMigration() {
  try {
    console.log("📊 Checking current table structure...");
    const [originalColumns] = await pool.query("DESCRIBE reviews_raw");
    console.log(`Current table has ${originalColumns.length} columns`);

    // Step 1: Create backup
    console.log("\n💾 Creating backup table...");
    await pool.query("DROP TABLE IF EXISTS reviews_raw_backup");
    await pool.query(
      "CREATE TABLE reviews_raw_backup AS SELECT * FROM reviews_raw"
    );

    const [backupCount] = await pool.query(
      "SELECT COUNT(*) as count FROM reviews_raw_backup"
    );
    const [originalCount] = await pool.query(
      "SELECT COUNT(*) as count FROM reviews_raw"
    );

    console.log(
      `✅ Backup created: ${backupCount[0].count} rows (original: ${originalCount[0].count} rows)`
    );

    if (backupCount[0].count !== originalCount[0].count) {
      throw new Error("Backup verification failed - row counts don't match");
    }

    // Step 2: Drop existing indexes
    console.log("\n🗑️ Dropping existing indexes...");
    const dropIndexes = [
      "DROP INDEX IF EXISTS idx_reviews_place_id ON reviews_raw",
      "DROP INDEX IF EXISTS idx_reviews_reviewer ON reviews_raw",
      "DROP INDEX IF EXISTS idx_reviews_rating ON reviews_raw",
      "DROP INDEX IF EXISTS idx_reviews_source ON reviews_raw",
      "DROP INDEX IF EXISTS idx_reviews_batch ON reviews_raw",
      "DROP INDEX IF EXISTS idx_reviews_crawltime ON reviews_raw",
      "DROP INDEX IF EXISTS idx_reviews_place_rating ON reviews_raw",
      "DROP INDEX IF EXISTS idx_reviews_source_batch ON reviews_raw",
    ];

    for (const sql of dropIndexes) {
      await runMigrationStep("Drop index", sql);
    }

    // Step 3: Rename and modify columns
    console.log("\n🔄 Modifying table structure...");

    const alterStatements = [
      // Rename columns
      "ALTER TABLE reviews_raw CHANGE COLUMN place_name name VARCHAR(255) NULL COMMENT 'Restaurant/business name'",
      "ALTER TABLE reviews_raw CHANGE COLUMN reviewer review_author VARCHAR(128) NULL COMMENT 'Review author name or ID'",
      "ALTER TABLE reviews_raw CHANGE COLUMN avg_rating rating FLOAT NULL COMMENT 'Overall place rating (0.0-5.0)'",
      "ALTER TABLE reviews_raw CHANGE COLUMN total_review user_ratings_total INT NULL COMMENT 'Total number of user ratings'",

      // Add new column
      "ALTER TABLE reviews_raw ADD COLUMN country VARCHAR(64) NULL COMMENT 'Country of the place' AFTER address",

      // Modify existing columns
      "ALTER TABLE reviews_raw MODIFY COLUMN place_id VARCHAR(64) NULL COMMENT 'Unique place identifier from source platform'",
      "ALTER TABLE reviews_raw MODIFY COLUMN review_rating FLOAT NULL COMMENT 'Individual review rating (1.0-5.0)'",
      "ALTER TABLE reviews_raw MODIFY COLUMN source VARCHAR(64) NULL COMMENT 'Review source platform'",

      // Remove unused columns
      "ALTER TABLE reviews_raw DROP COLUMN IF EXISTS batch_id",
      "ALTER TABLE reviews_raw DROP COLUMN IF EXISTS updated_at",
    ];

    for (const sql of alterStatements) {
      await runMigrationStep("Alter table", sql);
    }

    // Step 4: Create new indexes
    console.log("\n📊 Creating optimized indexes...");

    const createIndexes = [
      "CREATE INDEX idx_reviews_composite ON reviews_raw (place_id, source, review_author)",
      "CREATE INDEX idx_reviews_place_id ON reviews_raw (place_id)",
      "CREATE INDEX idx_reviews_source ON reviews_raw (source)",
      "CREATE INDEX idx_reviews_author ON reviews_raw (review_author)",
      "CREATE INDEX idx_reviews_rating ON reviews_raw (review_rating)",
      "CREATE INDEX idx_reviews_place_rating ON reviews_raw (rating)",
      "CREATE INDEX idx_reviews_country ON reviews_raw (country)",
      "CREATE INDEX idx_reviews_crawltime ON reviews_raw (crawltime)",
      "CREATE INDEX idx_reviews_source_country ON reviews_raw (source, country)",
      "CREATE INDEX idx_reviews_place_source ON reviews_raw (place_id, source)",
    ];

    for (const sql of createIndexes) {
      await runMigrationStep("Create index", sql);
    }

    // Step 5: Update data
    console.log("\n📝 Updating data to new format...");

    const dataUpdates = [
      "UPDATE reviews_raw SET source = 'Google' WHERE source IN ('GoogleMaps', 'Google Maps')",
      "UPDATE reviews_raw SET source = 'Yelp' WHERE source = 'Yelp'",
      "UPDATE reviews_raw SET source = 'TripAdvisor' WHERE source = 'TripAdvisor'",
      "UPDATE reviews_raw SET source = 'Foody' WHERE source = 'Foody'",
      "UPDATE reviews_raw SET source = 'Manual' WHERE source = 'Manual'",
      "UPDATE reviews_raw SET country = 'Vietnam' WHERE country IS NULL AND (address LIKE '%TP.HCM%' OR address LIKE '%Hồ Chí Minh%' OR address LIKE '%Quận%')",
    ];

    for (const sql of dataUpdates) {
      await runMigrationStep("Update data", sql);
    }

    // Step 6: Validate migration
    await validateTableStructure();
    await validateDataIntegrity();

    console.log("\n🎉 Migration completed successfully!");
    console.log("✅ Schema updated to unified multi-platform structure");
    console.log(
      "✅ Ready for Google, Yelp, VSA, SNAP and other review sources"
    );
    console.log("✅ Optimized for ML/data analytics workloads");

    console.log("\n💡 Backup table 'reviews_raw_backup' has been created");
    console.log(
      "💡 You can drop it after verifying the migration: DROP TABLE reviews_raw_backup;"
    );

    return true;
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    console.log("\n🔄 Attempting to restore from backup...");

    try {
      await pool.query("DROP TABLE IF EXISTS reviews_raw");
      await pool.query(
        "CREATE TABLE reviews_raw AS SELECT * FROM reviews_raw_backup"
      );
      console.log("✅ Backup restored successfully");
    } catch (restoreError) {
      console.error("❌ Backup restore failed:", restoreError.message);
      console.error("⚠️ Manual intervention required!");
    }

    return false;
  }
}

(async () => {
  try {
    // Check if database exists
    const [tables] = await pool.query("SHOW TABLES LIKE 'reviews_raw'");
    if (tables.length === 0) {
      console.error(
        "❌ reviews_raw table not found. Please run init-review-dataset.js first!"
      );
      process.exit(1);
    }

    const success = await performMigration();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error("❌ Migration script failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
