import { Pool, PoolConfig } from "pg";
import { logger } from "@utils/logger";

const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME || "hardware_inventory",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  max: parseInt(process.env.DB_POOL_MAX || "20", 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);

// Test connection and handle errors
pool.on("connect", () => {
  logger.info("Database connection established");
});

pool.on("error", (err) => {
  logger.error({ err }, "Unexpected database error");
  process.exit(-1);
});

// Helper function to execute queries
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug({ text, duration, rows: res.rowCount }, "Executed query");
    return res;
  } catch (error) {
    logger.error({ text, error }, "Query error");
    throw error;
  }
};

// Helper function for transactions
export const transaction = async <T>(
  callback: (client: any) => Promise<T>,
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await query("SELECT NOW()");
    logger.info(
      { time: result.rows[0] },
      "Database connection test successful",
    );
    return true;
  } catch (error) {
    logger.error({ error }, "Database connection test failed");
    return false;
  }
};
