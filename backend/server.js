const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();
const redis = require("redis");
const { ensureSchema } = require("./db");
const authRoute = require("./routes/authRoute");

const searchRoute = require("./routes/searchRoute");
const mediaInfoRoute = require("./routes/mediaInfoRoute");
const mediasByParamsRoute = require("./routes/mediasByParamsRoute");
const newsRoute = require("./routes/newsRoute");
const mediaEpisodesRoute = require("./routes/mediaEpisodesRoute");
const imdbRoute = require("./routes/imdbRoute");
const mediaChaptersRoute = require("./routes/mediaChaptersRoute");


const app = express();
const port = process.env.PORT || 1234;
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

let redisClient = null;
if (process.env.REDIS_URL) {
  redisClient = redis.createClient({ url: process.env.REDIS_URL });
} else if (process.env.DEV_MODE === "true") {
  redisClient = redis.createClient();
} else if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
  redisClient = redis.createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) },
  });
}

if (redisClient) {
  redisClient.on("error", (err) => console.error("Redis client error:", err));
  redisClient.connect().then(() => console.log("Redis connected")).catch((err) => {
    console.error("Redis connection failed:", err);
  });
}

app.use((req, res, next) => {
  req.redisClient = redisClient;
  next();
});

app.get("/", (_req, res) => {
  res.json({ message: "AniProject API", status: "ok" });
});
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/auth", authRoute);

app.use("/search", searchRoute);
app.use("/media-info", mediaInfoRoute);
app.use("/medias", mediasByParamsRoute);
app.use("/episodes", mediaEpisodesRoute);
app.use("/chapters", mediaChaptersRoute);
app.use("/news", newsRoute);
app.use("/imdb", imdbRoute);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  await ensureSchema();
  app.listen(port, "0.0.0.0", () => {
    console.log("AniProject API listening on port " + port);
  });
}

start().catch((err) => {
  console.error("API startup failed:", err);
  process.exit(1);
});
