// import pino from "pino";
// import { LOG_LEVEL, NODE_ENV } from "@config/env";

// const isProd = NODE_ENV === "production";
// const logLevel = LOG_LEVEL || "info";

// ── Logger
// export const logger = pino(
//   {
//     level: logLevel,
//     base: undefined,
//     timestamp: pino.stdTimeFunctions.isoTime,
//     redact: {
//       paths: ["req.headers.authorization", "password", "token"],
//       censor: "[REDACTED]",
//     },
//   },
//   isProd
//     ? undefined // Use default transport in production
//     : pino.transport({
//         targets: [
//           {
//             target: "pino-pretty",
//             level: logLevel,
//             options: {
//               colorize: true,
//               translateTime: "yyyy-mm-dd HH:MM:ss",
//               ignore: "pid,hostname",
//             },
//           },
//         ],
//       }),
// );

// morgan stream
// export const stream = { write: (msg: string) => logger.info(msg.trim()) };
