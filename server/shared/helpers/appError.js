const logger = require("../middleWare/logger");

class AppError extends Error {
  static success = false;

  constructor(
    message,
    statusCode = 500,
    type = "InternalError",
    meta = {},
    logOptions = {}
  ) {
    super(message);

    this.name = this.constructor.name;
    this.status = "error";
    this.statusCode = statusCode;
    this.type = type;
    this.meta = meta;
    // this.success = false;

    this.log(logOptions);
  }

  /*
   * Automatically logs error using the shared logger
   */
  log({ event = "unhandled_exception", ip = null, level = "auto" } = {}) {
    // Determine log method from type if level is auto
    const typeToLoggerMap = {
      AuthError: "security",
      ValidationError: "app",
      QueryError: "query",
      PerformanceError: "performance",
      InternalError: "error",
      AccessError: "access",
    };

    const loggerMethod =
      level !== "auto" ? level : typeToLoggerMap[this.type] || "error";

    const payload = {
      event,
      statusCode: this.statusCode,
      type: this.type,
      message: this.message,
      meta: this.meta,
      stack: this.stack,
      ip,
      timestamp: new Date().toISOString(),
    };

    // Only log if logger has the method
    if (typeof logger[loggerMethod] === "function") {
      logger[loggerMethod](payload);
    } else {
      logger.error(payload); // fallback
    }
  }

  toJSON() {
    const json = {
      success: AppError.success,
      status: this.status,
      statusCode: this.statusCode,
      message: this.message,
      type: this.type,
      meta: this.meta,
    };

    if (process.env.NODE_ENV !== "production") {
      json.stack = this.stack;
    }

    return json;
  }
}

module.exports = AppError;
