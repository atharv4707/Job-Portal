const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const env = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const publicProfileRoutes = require("./routes/publicProfileRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/error");

const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true
  })
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Too many auth attempts. Try again later." }
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api", publicProfileRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api", applicationRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const clientPath = path.join(__dirname, "../../client");
app.use(express.static(clientPath));

app.get("/", (_req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
