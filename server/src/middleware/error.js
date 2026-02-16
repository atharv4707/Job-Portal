function notFoundHandler(_req, res) {
  res.status(404).json({ message: "Route not found" });
}

function mapPrismaDatabaseError(error) {
  const prismaDbErrorCodes = new Set(["P1000", "P1001", "P1013", "P2021"]);
  if (!prismaDbErrorCodes.has(error?.code)) {
    return null;
  }

  return {
    statusCode: 503,
    message:
      process.env.NODE_ENV === "production"
        ? "Database unavailable. Check DATABASE_URL and run Prisma migrations."
        : error.message
  };
}

function errorHandler(error, _req, res, _next) {
  const mappedPrismaError = mapPrismaDatabaseError(error);
  const statusCode = mappedPrismaError?.statusCode || error.statusCode || 500;
  const message = mappedPrismaError?.message || error.message || "Internal server error";
  const payload = { message };

  if (error.details) {
    payload.details = error.details;
  }

  if (process.env.NODE_ENV !== "production" && error.stack) {
    payload.stack = error.stack;
  }

  res.status(statusCode).json(payload);
}

module.exports = {
  notFoundHandler,
  errorHandler
};
