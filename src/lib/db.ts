import { loadEnvConfig } from "@next/env";
// Force load environment variables from the current working directory
try {
  loadEnvConfig(process.cwd());
} catch (err) {
  console.error("[DB] Failed to load env config via @next/env:", err);
}

import mysql from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var dbPool: mysql.Pool | undefined;
}

console.log("[DB] Initializing connection pool with config:", {
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306", 10),
});

// Hostinger recommends using a connection pool for Node.js apps
export const pool =
  global.dbPool ??
  mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || "3306", 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Enable support for multiple statements in a query, which is useful for migration running
    multipleStatements: true,
  });

if (process.env.NODE_ENV !== "production") {
  global.dbPool = pool;
}

let dbInitializedPromise: Promise<void> | null = null;

async function ensureInitialized() {
  if (!dbInitializedPromise) {
    dbInitializedPromise = (async () => {
      try {
        const { initializeDatabase } = await import("./db-init");
        await initializeDatabase();
      } catch (error) {
        console.error("[DB] Database auto-init failed:", error);
        dbInitializedPromise = null; // Retry on next request if it failed
        throw error;
      }
    })();
  }
  return dbInitializedPromise;
}

/**
 * Execute a query that returns multiple rows.
 */
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  try {
    await ensureInitialized();
    const [rows] = await pool.query(sql, params);
    return rows as T[];
  } catch (error) {
    console.error(`[DB] query failed: ${sql}`, { params, error });
    throw error;
  }
}

/**
 * Execute a query that returns a single row (or null).
 */
export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  try {
    await ensureInitialized();
    const [rows] = await pool.query(sql, params);
    const arr = rows as T[];
    return arr.length > 0 ? arr[0] : null;
  } catch (error) {
    console.error(`[DB] queryOne failed: ${sql}`, { params, error });
    throw error;
  }
}

/**
 * Execute an INSERT, UPDATE, or DELETE query.
 * Returns metadata like affectedRows and insertId.
 */
export async function execute(sql: string, params?: any[]): Promise<mysql.ResultSetHeader> {
  try {
    await ensureInitialized();
    const [result] = await pool.execute(sql, params);
    return result as mysql.ResultSetHeader;
  } catch (error) {
    console.error(`[DB] execute failed: ${sql}`, { params, error });
    throw error;
  }
}

export default pool;

