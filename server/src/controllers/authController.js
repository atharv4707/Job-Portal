const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { hashPassword, comparePassword } = require("../utils/password");
const pickPublicUser = require("../utils/pickPublicUser");
const { validateRegisterInput, validateLoginInput } = require("../utils/validators");
const { ROLES } = require("../config/constants");
const {
  setAuthCookies,
  refreshSession,
  clearRefreshToken,
  clearAuthCookies
} = require("../services/authService");

const register = asyncHandler(async (req, res) => {
  const errors = validateRegisterInput(req.body);
  if (errors.length) {
    throw new ApiError(400, "Validation failed", errors);
  }

  const email = req.body.email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, "Email already in use");
  }

  const passwordHash = await hashPassword(req.body.password);

  let user;
  try {
    user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: req.body.name.trim(),
          email,
          passwordHash,
          role: req.body.role
        }
      });

      if (createdUser.role === ROLES.JOBSEEKER) {
        await tx.jobSeekerProfile.create({
          data: { userId: createdUser.id }
        });
      } else if (createdUser.role === ROLES.EMPLOYER) {
        await tx.employerProfile.create({
          data: { userId: createdUser.id }
        });
      }

      return createdUser;
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw new ApiError(409, "Email already in use");
    }
    throw error;
  }

  await setAuthCookies(user, res);

  res.status(201).json({
    message: "Registration successful",
    user: pickPublicUser(user)
  });
});

const login = asyncHandler(async (req, res) => {
  const errors = validateLoginInput(req.body);
  if (errors.length) {
    throw new ApiError(400, "Validation failed", errors);
  }

  const email = req.body.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const validPassword = await comparePassword(req.body.password, user.passwordHash);
  if (!validPassword) {
    throw new ApiError(401, "Invalid credentials");
  }

  await setAuthCookies(user, res);

  res.json({
    message: "Login successful",
    user: pickPublicUser(user)
  });
});

const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await clearRefreshToken(req.user.id);
  }

  clearAuthCookies(res);
  res.json({ message: "Logout successful" });
});

const me = asyncHandler(async (req, res) => {
  let profile = null;

  if (req.user.role === ROLES.JOBSEEKER) {
    profile = await prisma.jobSeekerProfile.findUnique({ where: { userId: req.user.id } });
  } else if (req.user.role === ROLES.EMPLOYER) {
    profile = await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });
  }

  res.json({
    user: pickPublicUser(req.user),
    profile
  });
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const user = await refreshSession(refreshToken, res);

  res.json({
    message: "Token refreshed",
    user: pickPublicUser(user)
  });
});

const requireSelfForLogout = asyncHandler(async (req, _res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }
  next();
});

module.exports = {
  register,
  login,
  logout,
  me,
  refresh,
  requireSelfForLogout
};
