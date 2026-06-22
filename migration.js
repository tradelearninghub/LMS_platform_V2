require("@next/env").loadEnvConfig(process.cwd());
const mysql = require("mysql2/promise");

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || "3306", 10),
  });

  try {
    console.log("Adding sort_order to courses...");
    await connection.query("ALTER TABLE courses ADD COLUMN sort_order INT NOT NULL DEFAULT 0;");
    console.log("Migration successful!");
  } catch (err) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("sort_order already exists.");
    } else {
      console.error("Migration failed:", err);
    }
  } finally {
    await connection.end();
  }
}

run();
