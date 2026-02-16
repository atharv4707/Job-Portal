const dotenv = require("dotenv");

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const defaultLocalDatabaseUrl = "mysql://root:password@localhost:3306/job_portal";
const databaseUrl =
  process.env.DATABASE_URL || (nodeEnv === "production" ? "" : defaultLocalDatabaseUrl);

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Set it in your environment variables.");
}

if (nodeEnv === "production" && /(localhost|127\.0\.0\.1)/i.test(databaseUrl)) {
  throw new Error("DATABASE_URL cannot point to localhost in production.");
}

const env = {
  nodeEnv,
  port: Number(process.env.PORT || 5000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5000",
  databaseUrl,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "access_secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "refresh_secret",
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d"
};

module.exports = env;
