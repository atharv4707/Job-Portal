const crypto = require("crypto");
const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const { getAccessCookieOptions, getRefreshCookieOptions } = require("../utils/cookies");

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function setAuthCookies(user, res) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: hashToken(refreshToken) }
  });

  res.cookie("accessToken", accessToken, getAccessCookieOptions());
  res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());
}

async function refreshSession(refreshToken, res) {
  if (!refreshToken) {
    throw new ApiError(401, "Missing refresh token");
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.refreshTokenHash) {
    throw new ApiError(401, "Unauthorized");
  }

  if (user.refreshTokenHash !== hashToken(refreshToken)) {
    throw new ApiError(401, "Unauthorized");
  }

  await setAuthCookies(user, res);
  return user;
}

async function clearRefreshToken(userId) {
  if (!userId) return;
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null }
    });
  } catch (error) {
    if (error?.code !== "P2025") {
      throw error;
    }
  }
}

function clearAuthCookies(res) {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
}

module.exports = {
  setAuthCookies,
  refreshSession,
  clearRefreshToken,
  clearAuthCookies
};
