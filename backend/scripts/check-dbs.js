require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const mysql = require("mysql2/promise");

// Pool để kiểm tra database knowledge
const poolKnowledge = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: Number(process.env.DB_PORT || 3306),
  password: process.env.DB_PASS,
  database: "knowledge",
  waitForConnections: true,
  connectionLimit: 10,
});

// Pool để kiểm tra database knowledge_sharing
const poolKnowledgeSharing = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: Number(process.env.DB_PORT || 3306),
  password: process.env.DB_PASS,
  database: "knowledge_sharing",
  waitForConnections: true,
  connectionLimit: 10,
});

(async () => {
  try {
    console.log("🔍 Checking both databases...\n");

    // Kiểm tra database 'knowledge'
    try {
      const [tablesKnowledge] = await poolKnowledge.query("SHOW TABLES");
      console.log(`📊 Database 'knowledge': ${tablesKnowledge.length} tables`);
      tablesKnowledge.forEach((row, index) => {
        const tableName = Object.values(row)[0];
        console.log(`  ${index + 1}. ${tableName}`);
      });
    } catch (err) {
      console.log(`❌ Database 'knowledge' error:`, err.message);
    }

    console.log();

    // Kiểm tra database 'knowledge_sharing'
    try {
      const [tablesKS] = await poolKnowledgeSharing.query("SHOW TABLES");
      console.log(`📊 Database 'knowledge_sharing': ${tablesKS.length} tables`);
      tablesKS.forEach((row, index) => {
        const tableName = Object.values(row)[0];
        console.log(`  ${index + 1}. ${tableName}`);
      });
    } catch (err) {
      console.log(`❌ Database 'knowledge_sharing' error:`, err.message);
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Check failed:", err.message);
    process.exit(1);
  }
})();
