import { readFileSync } from "fs";
import { join } from "path";
import { pool } from "@config/db.config";
import { logger } from "@utils/logger";

export const runMigrations = async (): Promise<void> => {
  try {
    logger.info("Running database migrations...");

    const migrationPath = join(
      __dirname,
      "migrations",
      "001_initial_schema.sql",
    );
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    await pool.query(migrationSQL);

    logger.info("Database migrations completed successfully");
  } catch (error) {
    logger.error({ error }, "Database migration failed");
    throw error;
  }
};

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info("Migrations finished");
      process.exit(0);
    })
    .catch((error) => {
      logger.error({ error }, "Migration error");
      process.exit(1);
    });
}
