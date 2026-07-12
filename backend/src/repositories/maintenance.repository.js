const prisma = require('../config/prisma');

class MaintenanceRepository {
  async getLatestMaintenanceForDate(datePrefix) {
    return prisma.maintenance.findFirst({
      where: {
        maintenanceNumber: {
          startsWith: datePrefix,
        },
      },
      orderBy: {
        maintenanceNumber: 'desc',
      },
    });
  }

  async createMaintenance(data) {
    return prisma.maintenance.create({
      data,
      include: {
        vehicle: true,
        reportedByUser: { select: { id: true, firstName: true, lastName: true } }
      },
    });
  }

  async findMaintenanceById(id) {
    return prisma.maintenance.findUnique({
      where: { id },
      include: {
        vehicle: true,
        reportedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        approvedByUser: { select: { id: true, firstName: true, lastName: true } },
        completedByUser: { select: { id: true, firstName: true, lastName: true } },
        cancelledByUser: { select: { id: true, firstName: true, lastName: true } }
      },
    });
  }

  async findAllMaintenance({ filters, sort, pagination }) {
    const { status, priority, maintenanceType, vehicleId, search } = filters;
    const { sortBy = 'createdAt', sortOrder = 'desc' } = sort;
    const { skip, take } = pagination;

    const where = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (maintenanceType) where.maintenanceType = maintenanceType;
    if (vehicleId) where.vehicleId = vehicleId;

    if (search) {
      where.OR = [
        { maintenanceNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [maintenanceLogs, total] = await Promise.all([
      prisma.maintenance.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take,
        include: {
          vehicle: { select: { id: true, registrationNumber: true, name: true } }
        },
      }),
      prisma.maintenance.count({ where }),
    ]);

    return { maintenanceLogs, total };
  }

  async updateMaintenance(id, data) {
    return prisma.maintenance.update({
      where: { id },
      data,
    });
  }

  // TRANSACTION: Start Maintenance
  async startMaintenance(maintenanceId, vehicleId) {
    return prisma.$transaction(async (tx) => {
      // 1. Update Maintenance
      const updatedMaintenance = await tx.maintenance.update({
        where: { id: maintenanceId },
        data: { status: 'IN_PROGRESS' },
      });

      // 2. Lock Vehicle in Shop
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'IN_SHOP' },
      });

      return updatedMaintenance;
    });
  }

  // TRANSACTION: Complete Maintenance
  async completeMaintenance(maintenanceId, vehicleId, actualCost, nextServiceDate, completedByUserId) {
    return prisma.$transaction(async (tx) => {
      // 1. Update Maintenance
      const updatedMaintenance = await tx.maintenance.update({
        where: { id: maintenanceId },
        data: {
          status: 'COMPLETED',
          actualCost,
          nextServiceDate,
          completedByUserId,
        },
      });

      // 2. Release Vehicle
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'AVAILABLE' },
      });

      return updatedMaintenance;
    });
  }

  // TRANSACTION: Cancel Maintenance
  async cancelMaintenance(maintenanceId, vehicleId, currentStatus, cancelledByUserId) {
    return prisma.$transaction(async (tx) => {
      // 1. Cancel Maintenance
      const updatedMaintenance = await tx.maintenance.update({
        where: { id: maintenanceId },
        data: {
          status: 'CANCELLED',
          cancelledByUserId
        },
      });

      // 2. Only release vehicle if it was locked
      if (currentStatus === 'IN_PROGRESS') {
        await tx.vehicle.update({
          where: { id: vehicleId },
          data: { status: 'AVAILABLE' },
        });
      }

      return updatedMaintenance;
    });
  }
}

module.exports = new MaintenanceRepository();
