const prisma = require('../config/prisma');

class UserRepository {
  async findUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: { role: true }, // Include role for RBAC
    });
  }

  async findUserById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  async findRoleByName(roleName) {
    return prisma.role.findUnique({
      where: { name: roleName },
    });
  }

  async createUser(userData) {
    return prisma.user.create({
      data: userData,
      include: { role: true },
    });
  }

  async updatePassword(id, newHashedPassword) {
    return prisma.user.update({
      where: { id },
      data: { password: newHashedPassword },
    });
  }
}

module.exports = new UserRepository();
