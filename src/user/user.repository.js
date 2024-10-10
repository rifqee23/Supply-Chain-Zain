const prisma = require('../db');

class UserRepository {
  async create(userData) {
    return await prisma.users.create({
      data: userData,
    });
  }

  async findAll() {
    return await prisma.users.findMany();
  }

  async findById(id) {
    return await prisma.users.findUnique({
      where: { id: parseInt(id) },
    });
  }

  async update(id, userData) {
    return await prisma.users.update({
      where: { id: parseInt(id) },
      data: userData,
    });
  }

  async delete(id) {
    return await prisma.users.delete({
      where: { id: parseInt(id) },
    });
  }
}

module.exports = UserRepository;