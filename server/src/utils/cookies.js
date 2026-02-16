const env = require("../config/env");

const baseCookieConfig = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax"
};

function getAccessCookieOptions() {
  return {
    ...baseCookieConfig,
    maxAge: 15 * 60 * 1000
  };
}

function getRefreshCookieOptions() {
  return {
    ...baseCookieConfig,
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

module.exports = {
  getAccessCookieOptions,
  getRefreshCookieOptions
};

