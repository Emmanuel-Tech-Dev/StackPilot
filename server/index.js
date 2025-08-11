const express = require("express");
const db = require("./shared/dbConfig/config.js");

const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimiter = require("express-rate-limit");
const bodyPaser = require("body-parser");
const morgan = require("morgan");
const csrf = require("csurf");
const helmet = require("helmet");
const http = require("http");
const socket = require("socket.io");

const baseRoute = require("./modules/base/base.route.js");
const uploadRoute = require("./modules/upload/upload.route.js");
const userRoute = require("./modules/user/user.route.js");
const transactionRoute = require("./modules/tansactions/transact.route.js");

const Utilities = require("./shared/helpers/functions.js");
const logger = require("./shared/middleWare/logger.js");
const { errorHandler } = require("./shared/middleWare/errorHandler.js");
const {
  authMiddleware,
  authenticateSocket,
} = require("./shared/middleWare/authMiddleware.js");
const NotificationService = require("./modules/notification/notfication.service.js");
const socketHelper = require("./shared/helpers/socket.js");

const app = express();
// const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
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

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://my-production-app.com",
  "https://staging-app.com",
];

app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(err.status || 500).json({ error: err.message });
});

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

app.use(helmet());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// app.use(authMiddleware);
app.use("/api/v1", baseRoute);
app.use("/api/v1/auth", userRoute);
app.use("/api/v1/upload", uploadRoute);
app.use("/api/v1/transaction", transactionRoute);

// app.use("/api/v2/auth", userRoute);
// app.use("/api/v2", rbacRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
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
