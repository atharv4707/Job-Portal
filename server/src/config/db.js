const prisma = require("./prisma");

async function connectDB() {
  await prisma.$connect();
}

module.exports = connectDB;
