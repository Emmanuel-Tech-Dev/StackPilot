const winston = require("winston");
const path = require("path");
require("winston-daily-rotate-file");
const fs = require("fs");

const logPath = path.join(__dirname, "../../resources/", "logs");

if (!fs.existsSync(logPath)) {
  fs.mkdirSync(logPath, { recursive: true });
}
// Log categories with their configurations
const LOG_TYPES = {
  access: { file: "access.log", level: "http" },
  error: { file: "error.log", level: "error" },
  query: { file: "query.log", level: "verbose" },
  security: { file: "security.log", level: "warn" },
  performance: { file: "performance.log", level: "debug" },
  app: { file: "app.log", level: "info" },
};

// Shared format for all transports
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(
    ({ timestamp, level, message }) =>
      `${timestamp} [${level.toUpperCase()}] ${
        typeof message === "object" ? JSON.stringify(message) : message
      }`
  )
);

// Transport cache and base logger
const transports = new Map();
const logger = winston.createLogger({
  level: "debug",
  transports: [new winston.transports.Console({ format: logFormat })],
});

// Create transport on first use
const ensureTransport = (type) => {
  if (!transports.has(type)) {
    const config = LOG_TYPES[type];
    const transport = new winston.transports.DailyRotateFile({
      filename: path.join(logPath, config.file),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "30d",
      level: config.level,
      format: logFormat,
    });

    logger.add(transport);
    transports.set(type, transport);
  }
};

// Dynamic log method with object handling
const log = (type, message) => {
  ensureTransport(type);
  logger.log(
    LOG_TYPES[type].level,
    typeof message === "object" ? JSON.stringify(message) : message
  );
};

// Export logger with category methods
module.exports = Object.assign(logger, {
  access: (msg) => log("access", msg),
  error: (msg) => log("error", msg),
  query: (msg) => log("query", msg),
  security: (msg) => log("security", msg),
  performance: (msg) => log("performance", msg),
  app: (msg) => log("app", msg),
});
