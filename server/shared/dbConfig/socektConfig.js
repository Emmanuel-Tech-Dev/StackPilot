// config/index.js
require("dotenv").config();

const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT) || 3000,
    host: process.env.HOST || "0.0.0.0",
    trustProxy: process.env.TRUST_PROXY === "true",
    environment: process.env.NODE_ENV || "development",
  },

  // Database Configuration
  database: {
    url:
      process.env.MONGODB_URL ||
      "mongodb://localhost:27017/notification_system",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
      serverSelectionTimeoutMS:
        parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT) || 5000,
      socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
      heartbeatFrequencyMS:
        parseInt(process.env.DB_HEARTBEAT_FREQUENCY) || 10000,
      maxIdleTimeMS: parseInt(process.env.DB_MAX_IDLE_TIME) || 30000,
    },
  },

  // JWT Configuration
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-change-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  // Socket.IO Configuration
  socket: {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? (process.env.CLIENT_URL || "").split(",").filter(Boolean)
          : [
              "http://localhost:3000",
              "http://localhost:3001",
              "http://localhost:5173",
              "http://127.0.0.1:5500",
            ],
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    transports: ["websocket", "polling"],
    pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT) || 60000,
    pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL) || 25000,
    upgradeTimeout: parseInt(process.env.SOCKET_UPGRADE_TIMEOUT) || 30000,
    maxHttpBufferSize: parseInt(process.env.SOCKET_MAX_BUFFER_SIZE) || 1e6, // 1MB
    httpCompression: process.env.SOCKET_HTTP_COMPRESSION !== "false",
    perMessageDeflate: {
      threshold: parseInt(process.env.SOCKET_COMPRESSION_THRESHOLD) || 1024,
      concurrencyLimit:
        parseInt(process.env.SOCKET_COMPRESSION_CONCURRENCY) || 10,
      memLevel: parseInt(process.env.SOCKET_COMPRESSION_MEM_LEVEL) || 7,
    },
    allowEIO3: process.env.SOCKET_ALLOW_EIO3 === "true", // For backward compatibility
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
    max:
      parseInt(process.env.RATE_LIMIT_MAX) ||
      (process.env.NODE_ENV === "production" ? 100 : 1000),
    message: {
      success: false,
      error: "Too many requests from this IP, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Socket rate limiting
    socketConnections: {
      maxPerMinute: parseInt(process.env.SOCKET_RATE_LIMIT_CONNECTIONS) || 10,
      maxPerHour:
        parseInt(process.env.SOCKET_RATE_LIMIT_CONNECTIONS_HOUR) || 100,
    },
  },

  // CORS Configuration
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? (process.env.CLIENT_URL || "").split(",").filter(Boolean)
        : true, // Allow all origins in development
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-API-Key",
      "X-Client-Version",
    ],
    exposedHeaders: ["X-Total-Count", "X-Page-Count"],
    maxAge: parseInt(process.env.CORS_MAX_AGE) || 86400, // 24 hours
  },

  // Security Configuration
  security: {
    helmet: {
      contentSecurityPolicy: process.env.NODE_ENV === "production",
      crossOriginEmbedderPolicy: false, // Needed for Socket.IO
      hsts: process.env.NODE_ENV === "production",
    },
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    sessionSecret:
      process.env.SESSION_SECRET || "your-session-secret-change-in-production",
  },

  // Notification Configuration
  notification: {
    defaultExpiry:
      parseInt(process.env.NOTIFICATION_DEFAULT_EXPIRY) ||
      30 * 24 * 60 * 60 * 1000, // 30 days
    maxNotificationsPerUser:
      parseInt(process.env.MAX_NOTIFICATIONS_PER_USER) || 1000,
    cleanupInterval:
      parseInt(process.env.NOTIFICATION_CLEANUP_INTERVAL) || 60 * 60 * 1000, // 1 hour
    batchSize: parseInt(process.env.NOTIFICATION_BATCH_SIZE) || 100,
    priorities: {
      low: { weight: 1, alertUser: false },
      medium: { weight: 2, alertUser: false },
      high: { weight: 3, alertUser: true },
      critical: { weight: 4, alertUser: true },
    },
    categories: {
      system: { color: "#2196f3", icon: "system" },
      user: { color: "#4caf50", icon: "person" },
      security: { color: "#f44336", icon: "security" },
      payment: { color: "#ff9800", icon: "payment" },
      marketing: { color: "#9c27b0", icon: "campaign" },
    },
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: process.env.LOG_FORMAT || "combined",
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
    maxSize: process.env.LOG_MAX_SIZE || "10m",
    datePattern: process.env.LOG_DATE_PATTERN || "YYYY-MM-DD",
  },

  // Email Configuration (if you plan to add email notifications)
  email: {
    service: process.env.EMAIL_SERVICE || "gmail",
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    from: process.env.EMAIL_FROM || "notifications@yourapp.com",
  },

  // SMS Configuration (if you plan to add SMS notifications)
  sms: {
    provider: process.env.SMS_PROVIDER || "twilio",
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_FROM_NUMBER,
  },

  // Push Notification Configuration
  push: {
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
    vapidEmail: process.env.VAPID_EMAIL,
  },

  // Webhook Configuration
  webhook: {
    secret: process.env.WEBHOOK_SECRET,
    timeout: parseInt(process.env.WEBHOOK_TIMEOUT) || 30000,
    retryAttempts: parseInt(process.env.WEBHOOK_RETRY_ATTEMPTS) || 3,
    retryDelay: parseInt(process.env.WEBHOOK_RETRY_DELAY) || 1000,
  },

  // Redis Configuration (if you want to use Redis for scaling)
  redis: {
    enabled: process.env.REDIS_ENABLED === "true",
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB) || 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX || "notification:",
    ttl: parseInt(process.env.REDIS_TTL) || 3600, // 1 hour
  },

  // Health Check Configuration
  health: {
    interval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 5 * 60 * 1000, // 5 minutes
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000,
    retries: parseInt(process.env.HEALTH_CHECK_RETRIES) || 3,
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    allowedTypes: (
      process.env.ALLOWED_FILE_TYPES ||
      "image/jpeg,image/png,image/gif,application/pdf"
    ).split(","),
    uploadDir: process.env.UPLOAD_DIR || "./uploads",
    tempDir: process.env.TEMP_DIR || "./temp",
  },

  // API Configuration
  api: {
    version: process.env.API_VERSION || "v1",
    prefix: process.env.API_PREFIX || "/api",
    timeout: parseInt(process.env.API_TIMEOUT) || 30000,
    maxRequestSize: process.env.MAX_REQUEST_SIZE || "10mb",
  },
};

// Validation function to check required environment variables
const validateConfig = () => {
  const required = [];
  const missing = [];

  if (config.server.environment === "production") {
    required.push("JWT_SECRET", "MONGODB_URL", "CLIENT_URL");
  }

  required.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.error(
      "❌ Missing required environment variables:",
      missing.join(", ")
    );
    console.error(
      "💡 Please check your .env file or environment configuration"
    );
    return false;
  }

  return true;
};

// Helper function to get configuration by path
const get = (path, defaultValue = null) => {
  return path.split(".").reduce((obj, key) => {
    return obj && obj[key] !== undefined ? obj[key] : defaultValue;
  }, config);
};

// Helper function to check if we're in development
const isDevelopment = () => config.server.environment === "development";

// Helper function to check if we're in production
const isProduction = () => config.server.environment === "production";

// Helper function to check if we're in test
const isTest = () => config.server.environment === "test";

module.exports = {
  ...config,
  validateConfig,
  get,
  isDevelopment,
  isProduction,
  isTest,
};
