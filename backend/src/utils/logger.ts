import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import pino from "pino";
import { LOG_DIR, LOG_LEVEL, NODE_ENV } from "@config/env";

const isProd = NODE_ENV === "production";
const logRoot = LOG_DIR || "logs";
const logLevel = LOG_LEVEL || "info";

const projectRoot = process.cwd();
const logDir = join(projectRoot, logRoot);

try {
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
    console.log(`[Logger Init] Created log directory: ${logDir}`);
  } else {
    console.log(`[Logger Init] Log directory already exists: ${logDir}`);
  }
} catch (error) {
  console.error(
    `[Logger Init] Failed to create log directory: ${logDir}`,
    error,
  );
  throw error;
}

const prodFile = join(logDir, "app");
const devFile = join(logDir, "app.dev");
const errorFile = join(logDir, "error");

// Pino
const transport = pino.transport({
  targets: isProd
    ? [
        // prod:
        {
          target: "pino-roll",
          level: logLevel,
          options: {
            file: prodFile,
            frequency: "daily", // 'daily' | 'hourly' | number(ms)
            size: "50m",
            dateFormat: "yyyy-MM-dd",
            extension: ".log",
            mkdir: true,
            symlink: true, // current.log
            limit: { count: 30 },
          },
        },

        {
          target: "pino-roll",
          level: "error",
          options: {
            file: errorFile,
            frequency: "daily",
            size: "50m",
            dateFormat: "yyyy-MM-dd",
            extension: ".log",
            mkdir: true,
            symlink: true,
            limit: { count: 60 },
          },
        },
      ]
    : [
        // dev:
        {
          target: "pino-pretty",
          level: logLevel,
          options: {
            colorize: true,
            translateTime: "yyyy-mm-dd HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
        // dev:
        {
          target: "pino-roll",
          level: logLevel,
          options: {
            file: devFile,
            frequency: "daily",
            size: "20m",
            dateFormat: "yyyy-MM-dd",
            extension: ".log",
            mkdir: true,
            symlink: true,
            limit: { count: 7 },
          },
        },
      ],
});

// ── Logger
export const logger = pino(
  {
    level: logLevel,
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: ["req.headers.authorization", "password", "token"],
      censor: "[REDACTED]",
    },
  },
  transport,
);

// morgan stream
export const stream = { write: (msg: string) => logger.info(msg.trim()) };
