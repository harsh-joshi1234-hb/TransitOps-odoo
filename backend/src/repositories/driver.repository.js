const prisma = require('../config/prisma');

class DriverRepository {
  async createDriver(data) {
    return prisma.driver.create({
      data,
    });
  }

  async findDriverById(id) {
    return prisma.driver.findUnique({
      where: { id },
    });
  }

  async findDriverByLicense(licenseNumber) {
    return prisma.driver.findUnique({
      where: { licenseNumber },
    });
  }

  async findDriverByEmail(email) {
    return prisma.driver.findUnique({
      where: { email },
    });
  }

  async findDriverByContactNumber(contactNumber) {
    return prisma.driver.findUnique({
      where: { contactNumber },
    });
  }

  async findAllDrivers({ filters, sort, pagination }) {
    const { status, safetyScore, expiringSoon, isDeleted, search } = filters;
    const { sortBy = 'createdAt', sortOrder = 'desc' } = sort;
    const { skip, take } = pagination;

    const where = {
      isDeleted: isDeleted !== undefined ? isDeleted : false,
    };

    if (status) {
      where.status = status;
    }

    if (safetyScore) {
      where.safetyScore = {
        gte: parseFloat(safetyScore),
      };
    }

    if (expiringSoon === 'true') {
      const today = new Date();
      const nextMonth = new Date(today.setMonth(today.getMonth() + 1));
      where.licenseExpiryDate = {
        lte: nextMonth, // Expiring within 1 month
        gte: new Date(), // Not already expired
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { contactNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take,
      }),
      prisma.driver.count({ where }),
    ]);

    return { drivers, total };
  }

  async updateDriver(id, data) {
    return prisma.driver.update({
      where: { id },
      data,
    });
  }

  async softDeleteDriver(id) {
    return prisma.driver.update({
      where: { id },
      data: {
        isDeleted: true,
        status: 'OFF_DUTY', // Logical status update
      },
    });
  }

  async restoreDriver(id) {
    return prisma.driver.update({
      where: { id },
      data: {
        isDeleted: false,
        status: 'AVAILABLE',
      },
    });
  }
}

module.exports = new DriverRepository();
