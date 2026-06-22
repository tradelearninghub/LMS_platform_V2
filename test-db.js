const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

// Manually parse .env file since dotenv might not be installed
function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) {
    console.log("⚠️ No .env file found in " + envPath);
    return;
  }
  const content = fs.readFileSync(envPath, "utf8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      // Remove surrounding quotes if any
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      process.env[key] = val;
    }
  });
  console.log("Loaded environment variables from .env file.");
}

async function testConnection() {
  loadEnv();

  const config = {
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || "3306", 10),
  };

  console.log("\nDatabase Configuration:");
  console.log(`- Host: ${config.host}`);
  console.log(`- Port: ${config.port}`);
  console.log(`- User: ${config.user}`);
  console.log(`- Database: ${config.database}`);
  console.log(`- Password length: ${config.password ? config.password.length : 0} characters`);

  console.log("\nConnecting to database...");
  try {
    const connection = await mysql.createConnection(config);
    console.log("✅ Success! Connected to database successfully.");

    // Check tables
    const [rows] = await connection.query("SHOW TABLES");
    console.log(`✅ Success! Query SHOW TABLES returned ${rows.length} tables:`);
    console.log(rows.map((r) => Object.values(r)[0]));

    await connection.end();
  } catch (err) {
    console.error("❌ Connection failed!");
    console.error(err);

    if (config.host === "127.0.0.1") {
      console.log(
        '\n💡 Tip: Since connection to 127.0.0.1 failed, try changing DB_HOST to "localhost" in your .env file and re-run this test.'
      );
    } else if (config.host === "localhost") {
      console.log(
        '\n💡 Tip: Since connection to localhost failed, try changing DB_HOST to "127.0.0.1" in your .env file and re-run this test.'
      );
    }
  }
}

testConnection();
