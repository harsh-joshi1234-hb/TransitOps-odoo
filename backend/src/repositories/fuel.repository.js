const prisma = require('../config/prisma');

class FuelRepository {
  async getLatestFuelLogForDate(datePrefix) {
    return prisma.fuelLog.findFirst({
      where: {
        fuelLogNumber: {
          startsWith: datePrefix,
        },
      },
      orderBy: {
        fuelLogNumber: 'desc',
      },
    });
  }

  async createFuelLog(data) {
    return prisma.fuelLog.create({
      data,
      include: {
        vehicle: true,
      },
    });
  }

  async findFuelLogById(id) {
    return prisma.fuelLog.findUnique({
      where: { id, isDeleted: false },
      include: {
        vehicle: { select: { id: true, registrationNumber: true, name: true, fuelType: true, fuelTankCapacity: true } },
        trip: { select: { id: true, tripNumber: true } },
        driver: { select: { id: true, name: true } },
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
        approvedByUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async findAllFuelLogs({ filters, sort, pagination }) {
    const { status, vehicleId, tripId, fuelType, search } = filters;
    const { sortBy = 'filledAt', sortOrder = 'desc' } = sort;
    const { skip, take } = pagination;

    const where = { isDeleted: false };

    if (status) where.status = status;
    if (vehicleId) where.vehicleId = vehicleId;
    if (tripId) where.tripId = tripId;
    if (fuelType) where.fuelType = fuelType;

    if (search) {
      where.OR = [
        { fuelLogNumber: { contains: search, mode: 'insensitive' } },
        { fuelStation: { contains: search, mode: 'insensitive' } },
        { vendor: { contains: search, mode: 'insensitive' } },
        { receiptNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [fuelLogs, total] = await Promise.all([
      prisma.fuelLog.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take,
        include: {
          vehicle: { select: { id: true, registrationNumber: true } }
        },
      }),
      prisma.fuelLog.count({ where }),
    ]);

    return { fuelLogs, total };
  }

  async updateFuelLog(id, data) {
    return prisma.fuelLog.update({
      where: { id },
      data,
    });
  }

  // TRANSACTION: Approve Fuel Log
  async approveFuelLog(fuelLogId, vehicleId, fuelLogOdometer, approvedByUserId) {
    return prisma.$transaction(async (tx) => {
      // 1. Update FuelLog
      const updatedFuelLog = await tx.fuelLog.update({
        where: { id: fuelLogId },
        data: {
          status: 'APPROVED',
          approvedByUserId,
          approvedAt: new Date(),
        },
      });

      // 2. Fetch current vehicle
      const vehicle = await tx.vehicle.findUnique({
        where: { id: vehicleId }
      });

      // 3. Update Vehicle odometer ONLY if the fuel log odometer is greater than current
      if (vehicle && fuelLogOdometer > vehicle.odometer) {
        await tx.vehicle.update({
          where: { id: vehicleId },
          data: { odometer: fuelLogOdometer },
        });
      }

      return updatedFuelLog;
    });
  }

  async softDeleteFuelLog(id) {
    return prisma.fuelLog.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}

module.exports = new FuelRepository();
