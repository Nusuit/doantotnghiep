const mysql = require("mysql2/promise");

async function checkDatabaseSchema() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "rootpassword", // Update this with actual password
      database: "knowledge",
    });

    console.log("✅ Connected to database");

    // Check table structure
    const [columns] = await connection.execute("DESCRIBE users");
    console.log("\n📋 Users table structure:");
    columns.forEach((col) => {
      console.log(
        `- ${col.Field} (${col.Type}) ${
          col.Null === "YES" ? "NULL" : "NOT NULL"
        } ${col.Default ? `DEFAULT: ${col.Default}` : ""}`
      );
    });

    // Check sample user data
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = "huykien283@gmail.com" LIMIT 1'
    );
    if (users.length > 0) {
      console.log("\n👤 Sample user data:");
      console.log(JSON.stringify(users[0], null, 2));
    } else {
      console.log("\n❌ No user found with email huykien283@gmail.com");
    }

    await connection.end();
  } catch (error) {
    console.error("❌ Database error:", error.message);
  }
}

checkDatabaseSchema();
