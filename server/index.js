const express = require("express");
const db = require("./shared/dbConfig/config.js");
const responseTime = require("response-time");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimiter = require("express-rate-limit");
const bodyPaser = require("body-parser");
const morgan = require("morgan");
const csrf = require("csurf");
const helmet = require("helmet");
const http = require("http");
const socket = require("socket.io");
const fs = require("fs");
const path = require("path");
const baseRoute = require("./modules/base/base.route.js");
const uploadRoute = require("./modules/upload/upload.route.js");
const userRoute = require("./modules/user/user.route.js");
const transactionRoute = require("./modules/tansactions/transact.route.js");
const tableModelRoutes = require("./modules/tablemodel/tablemodel.route.js");
const logs = require("./modules/base/base.logs.js");
const Utilities = require("./shared/helpers/functions.js");
const logger = require("./shared/middleWare/logger.js");
const { errorHandler } = require("./shared/middleWare/errorHandler.js");
const {
  authMiddleware,
  authenticateSocket,
} = require("./shared/middleWare/authMiddleware.js");

const socketHelper = require("./shared/helpers/socket.js");

const app = express();
// const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// const io = socket(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

app.use(cookieParser());
app.use(express.json());
app.use(limiter);
app.use(bodyPaser.json());
app.use(bodyPaser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(responseTime());
const allowedOrigins = [
  "http://localhost:3001",
  "http://localhost:5173",
  "https://my-production-app.com",
  "https://staging-app.com",
];

// app.use((err, req, res, next) => {
//   logger.error(err.message);
//   res.status(err.status || 500).json({ error: err.message });
// });

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200,
  })
);

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, DELETE , PATCH"
//   );
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//   next();
// });
app.use(helmet());
app.get("/favicon.ico", (req, res) => res.status(204));
// app.use(express.static("../frontend/build"));
// const publicPath = path.resolve(__dirname, "resources/adphotos");
// const voiceNotePath = path.resolve(__dirname, "resources/voicenotes");
// const msgImgPath = path.resolve(__dirname, "resources/msgimages");
// const sysImgPath = path.resolve(__dirname, "resources/sysimg");
// const usersImgPath = path.resolve(__dirname, "resources/users");
// const pdfsFilePath = path.resolve(__dirname, "resources/pdfs");

// const staticFilesOptions = {};
// app.get("/:pic", express.static(publicPath, staticFilesOptions));
// app.get("/:voice", express.static(voiceNotePath, staticFilesOptions));
// app.get("/:img", express.static(msgImgPath, staticFilesOptions));
// app.get("/:img", express.static(sysImgPath, staticFilesOptions));
// app.get("/:img", express.static(usersImgPath, staticFilesOptions));
// app.get("/:pdf", express.static(pdfsFilePath, staticFilesOptions));

// app.get("*", (req, res) => {
//   res.sendFile(path.resolve("../frontend/build/index.html"));
// });
// app.use(authMiddleware);
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use("/api/v1", baseRoute);
app.use("/api/v1/auth", userRoute);
app.use("/api/v1/upload", uploadRoute);
app.use("/api/v1/transaction", transactionRoute);
app.use("/api/v2", tableModelRoutes);
app.use("/api/v2", logs);
// app.use("/api/v2/auth", userRoute);
// app.use("/api/v2", rbacRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/logs", async (req, res) => {
  try {
    const logDirectory = "./resources/logs"; // Adjust path as needed
    const allLogs = [];

    // Read all files in the logs directory
    const files = fs.readdirSync(logDirectory);

    files.forEach((file, fileIndex) => {
      if (file.endsWith(".log") || file.includes(".log.")) {
        const filePath = path.join(logDirectory, file);
        const content = fs.readFileSync(filePath, "utf-8");
        const lines = content.split("\n").filter((line) => line.trim());

        lines.forEach((line, lineIndex) => {
          // Try to parse JSON format first (like your example)
          if (line.includes("{") && line.includes("}")) {
            try {
              // Extract the JSON part
              const jsonMatch = line.match(/\{.*\}/);
              if (jsonMatch) {
                const logData = JSON.parse(jsonMatch[0]);

                // Extract log level from the beginning of the line
                const levelMatch = line.match(/\[(\w+)\]/);
                const level = levelMatch ? levelMatch[1] : "INFO";

                // Determine log type from filename
                let logType = "app";
                if (file.includes("security")) logType = "security";
                else if (file.includes("access")) logType = "access";
                else if (file.includes("query")) logType = "query";

                // Create simplified log object
                const logEntry = {
                  id: `${fileIndex}-${lineIndex}`,
                  timestamp: logData.timestamp,
                  level: level,
                  event: logData.event || "UNKNOWN_EVENT",
                  statusCode: logData.statusCode || null,
                  type: logData.type || "Unknown",
                  message: logData.message || "No message",
                  logType: logType,
                  filename: file,
                  // Add any additional fields from meta if they exist
                  ip: logData.meta?.request?.ip || null,
                  method: logData.meta?.request?.method || null,
                  path: logData.meta?.request?.path || null,
                  userAgent: logData.meta?.request?.userAgent || null,
                  user: logData.meta?.user || null,
                  raw: line, // Keep raw log line for debugging
                };

                allLogs.push(logEntry);
              }
            } catch (parseError) {
              // If JSON parsing fails, create a simple entry
              console.log("Failed to parse JSON:", parseError.message);
            }
          } else {
            // Handle non-JSON log lines (standard format)
            // Example: "2025-08-28T14:52:41.149Z [WARN] Some message"
            const match = line.match(
              /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*?)\s+\[(\w+)\]\s+(.+)$/
            );
            if (match) {
              const [, timestamp, level, message] = match;
              allLogs.push({
                id: `${fileIndex}-${lineIndex}`,
                timestamp: timestamp,
                level: level,
                event: "STANDARD_LOG",
                statusCode: null,
                type: "StandardLog",
                message: message,
                logType: file.includes("security")
                  ? "security"
                  : file.includes("access")
                  ? "access"
                  : file.includes("query")
                  ? "query"
                  : "app",
                filename: file,
                raw: line,
              });
            }
          }
        });
      }
    });

    // Sort by timestamp (newest first)
    allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      logs: allLogs,
      total: allLogs.length,
      message: "All logs retrieved successfully",
    });
  } catch (error) {
    console.error("Error reading logs:", error);
    res.status(500).json({
      error: "Failed to read logs",
      details: error.message,
    });
  }
});

// app.get("/socket/health", (req, res) => {
//   res.json({
//     status: "OK",
//     timestamp: new Date().toISOString(),
//     connectedUsers: NotificationService.getConnectedUsersCount(),
//   });
// });

app.use(errorHandler);

function initializeSocket() {
  const socketConfig = {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.CLIENT_URL
          : [
              "http://localhost:3000",
              "http://localhost:3001",
              "http://localhost:5173",
            ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT) || 60000,
    pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL) || 25000,
    upgradeTimeout: 30000,
    httpCompression: true,
    perMessageDeflate: {
      threshold: 1024,
    },
  };

  // Initialize socket helper
  socketHelper.initialize(this.server, socketConfig);

  // Add custom middlewares if needed
  socketHelper.addCustomMiddleware((socket, next) => {
    // Custom validation middleware
    if (!socket.handshake.headers["user-agent"]) {
      return next(new Error("User agent required"));
    }
    next();
  });

  // Add custom event handlers
  socketHelper.addCustomEventHandler("userConnected", ({ userId }) => {
    // Custom logic when user connects
    this.onUserConnected(userId);
  });

  socketHelper.addCustomEventHandler("userDisconnected", ({ userId }) => {
    // Custom logic when user disconnects
    this.onUserDisconnected(userId);
  });

  console.log("✅ Socket.IO initialized with helper");
}

async function startServer() {
  try {
    await db.authenticate();
    const models = await Utilities.loadDynamicModels(db);
    // console.log(models);
    Object.assign(db.models, models);

    await db.sync({ force: false });

    console.log("Connected to MySQL database");

    console.log("Database synced successfully");

    if (models) {
      console.log("Table models synchronized");
    }

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to MySQL:", error);
    logger.error({
      message: "Unable to connect to MySQL",
      error: error.message,
      errorDetails: error,
    });
  }
}

startServer();
// initializeSocket();
