const express = require("express");
const db = require("./shared/dbConfig/config.js");

// const customModels = require("./model/customModels/index.js");
// const AdiminPath = require("./model/AdminPath.js");

const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimiter = require("express-rate-limit");
const bodyPaser = require("body-parser");
const morgan = require("morgan");
const csrf = require("csurf");
const helmet = require("helmet");

// const goalsRoute = require("./routes/goalsRoute.js");
// const TwelveweekYearRoute = require("./routes/12weekYearRoute.js");
// const weeklyRoute = require("./routes/weeklyRoute.js");
// const dailyRoute = require("./routes/dailyRoute.js");
// const taskRoute = require("./routes/taskRoute.js");
const baseRoute = require("./modules/base/base.route.js");
const uploadRoute = require("./modules/upload/upload.route.js");
const userRoute = require("./modules/user/user.route.js");
// const authRoute = require("./routes/authRoute.js");
// const rbacRoutes = require("./routes/rbacRoutes.js");
const Utilities = require("./shared/helpers/functions.js");
const logger = require("./shared/middleWare/logger.js");
const { errorHandler } = require("./shared/middleWare/errorHandler.js");
// const auth0 = require("./shared/dbConfig/auth0_config.js");
// const Role = require("./model/role.js");
// const RoleAdminPath = require("./model/RoleAdminPath.js");

const app = express();

const PORT = process.env.PORT || 3000;

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

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
app.use("/api/v1", baseRoute);
app.use("/api/v1.0/auth", userRoute);
app.use("/api/v2", uploadRoute);

// app.use("/api/v2/auth", userRoute);
// app.use("/api/v2", rbacRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(errorHandler);

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
