const express = require("express");
const db = require("./dbConfig/config");

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
const genericRoute = require("./routes/genericRoute.js");
const authRoute = require("./routes/authRoute.js");
const rbacRoutes = require("./routes/rbacRoutes.js");
const utils = require("./helpers/functions.js");
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
    methods: ["GET", "POST", "PUT", "DELETE"],
    optionsSuccessStatus: 200,
  })
);

app.use(helmet());

app.use("/api/v1", genericRoute);
app.use("/api/v2/auth", authRoute);
app.use("/api/v2", rbacRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

async function startServer() {
  try {
    await db.authenticate();
    const models = await utils.loadDynamicModels(db);

    Object.assign(db.models, models);

    await db.sync({ force: false });

    console.log("Connected to MySQL database");

    console.log("Database synced successfully");
    console.log("Table models synchronized");

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to MySQL:", error);
  }
}

startServer();
