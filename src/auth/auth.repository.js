const prisma = require("../db");

async function createUser(userData) {
  try {
    return await prisma.users.create({ data: userData });
  } catch (error) {
    throw new Error(error.message);
  }
}

async function findUserByUsername(username) {
  return prisma.users.findUnique({ where: { username } });
}

module.exports = {
  createUser,
  findUserByUsername,
};
