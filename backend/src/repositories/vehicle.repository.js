const prisma = require('../config/prisma');

class VehicleRepository {
  async createVehicle(data) {
    return prisma.vehicle.create({
      data,
    });
  }

  async findVehicleById(id) {
    return prisma.vehicle.findUnique({
      where: { id },
    });
  }

  async findVehicleByRegNumber(registrationNumber) {
    return prisma.vehicle.findUnique({
      where: { registrationNumber },
    });
  }

  async findAllVehicles({ filters, sort, pagination }) {
    const { status, type, isDeleted } = filters;
    const { sortBy = 'createdAt', sortOrder = 'desc' } = sort;
    const { skip, take } = pagination;

    const where = {
      isDeleted: isDeleted !== undefined ? isDeleted : false, // Default to not deleted
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    // Support searching by Registration Number or Vehicle Name (basic ILIKE search)
    if (filters.search) {
      where.OR = [
        { registrationNumber: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take,
      }),
      prisma.vehicle.count({ where }),
    ]);

    return { vehicles, total };
  }

  async updateVehicle(id, data) {
    return prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  async softDeleteVehicle(id) {
    return prisma.vehicle.update({
      where: { id },
      data: {
        isDeleted: true,
        status: 'RETIRED', // Optional: Business rule might dictate retired on delete
      },
    });
  }

  async restoreVehicle(id) {
    return prisma.vehicle.update({
      where: { id },
      data: {
        isDeleted: false,
        status: 'AVAILABLE',
      },
    });
  }
}

module.exports = new VehicleRepository();
