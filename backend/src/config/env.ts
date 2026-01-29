import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";
import { z } from "zod";

/**
 * 1) Load dotenv files in order:
 *    - .env (common/default)
 *    - .env.{NODE_ENV}.local (environment-specific override, overwrites if exists)
 */
config(); // load .env
const nodeEnv = process.env.NODE_ENV || "development";
const layerPath = resolve(process.cwd(), `.env.${nodeEnv}.local`);
if (existsSync(layerPath)) {
  config({ path: layerPath }); // load environment-specific .env file
}

/**
 * 2) Define Zod schema for environment variables
 *    - Required/optional/default values can be adjusted as needed
 */
const EnvSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().int().positive().optional(), // default handled in app.ts

    SECRET_KEY: z.string().min(1), // required secret key

    LOG_FORMAT: z.string().min(1).optional(), // default handled in app.ts
    LOG_DIR: z.string().min(1),
    LOG_LEVEL: z.string().min(1),

    ORIGIN: z.string().min(1), // can be converted to array if needed
    CREDENTIALS: z.coerce.boolean(), // converts 'true'/'false' string → boolean
    CORS_ORIGINS: z.string().optional(), // comma-separated string, e.g. "http://a.com,http://b.com"

    API_SERVER_URL: z.string().url().optional(),

    SENTRY_DSN: z.string().default(""),
    REDIS_URL: z.string().url().default("redis://localhost:6379"),
  })
  .strip(); // remove extra variables not defined in schema

/**
 * 3) Validate environment variables
 */
const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("\n❌ Invalid environment variables:\n");
  console.error(parsed.error.format());
  process.exit(1);
}
const env = parsed.data;

// Export environment variables
export const NODE_ENV = env.NODE_ENV;
export const PORT = env.PORT; // app.ts handles default PORT if undefined
export const SECRET_KEY = env.SECRET_KEY;

export const LOG_FORMAT = env.LOG_FORMAT; // default handled in app.ts
export const LOG_DIR = env.LOG_DIR;
export const LOG_LEVEL = env.LOG_LEVEL;

export const ORIGIN = env.ORIGIN;
export const CREDENTIALS = env.CREDENTIALS;

export const SENTRY_DSN = env.SENTRY_DSN;
export const REDIS_URL = env.REDIS_URL;
export const API_SERVER_URL = env.API_SERVER_URL;

// Provide CORS origins as an array (empty array if none defined)
export const CORS_ORIGIN_LIST =
  env.CORS_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? [];
