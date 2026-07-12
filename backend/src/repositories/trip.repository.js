const prisma = require('../config/prisma');

class TripRepository {
  async getLatestTripForDate(datePrefix) {
    // Expected datePrefix: e.g. "TRP-20231012"
    return prisma.trip.findFirst({
      where: {
        tripNumber: {
          startsWith: datePrefix,
        },
      },
      orderBy: {
        tripNumber: 'desc',
      },
    });
  }

  async createTrip(data) {
    return prisma.trip.create({
      data,
      include: {
        vehicle: true,
        driver: true,
      },
    });
  }

  async findTripById(id) {
    return prisma.trip.findUnique({
      where: { id },
      include: {
        vehicle: true,
        driver: true,
        createdByUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        completedByUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        }
      },
    });
  }

  async findAllTrips({ filters, sort, pagination }) {
    const { status, priority, search, vehicleId, driverId } = filters;
    const { sortBy = 'createdAt', sortOrder = 'desc' } = sort;
    const { skip, take } = pagination;

    const where = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (vehicleId) where.vehicleId = vehicleId;
    if (driverId) where.driverId = driverId;

    if (search) {
      where.OR = [
        { tripNumber: { contains: search, mode: 'insensitive' } },
        { source: { contains: search, mode: 'insensitive' } },
        { destination: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take,
        include: {
          vehicle: { select: { id: true, registrationNumber: true, name: true } },
          driver: { select: { id: true, name: true, contactNumber: true } },
        },
      }),
      prisma.trip.count({ where }),
    ]);

    return { trips, total };
  }

  async updateTrip(id, data) {
    return prisma.trip.update({
      where: { id },
      data,
    });
  }

  // TRANSACTION: Dispatch Trip
  async dispatchTrip(tripId, vehicleId, driverId) {
    return prisma.$transaction(async (tx) => {
      // 1. Update Trip
      const updatedTrip = await tx.trip.update({
        where: { id: tripId },
        data: { status: 'DISPATCHED' },
      });

      // 2. Lock Vehicle
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'ON_TRIP' },
      });

      // 3. Lock Driver
      await tx.driver.update({
        where: { id: driverId },
        data: { status: 'ON_TRIP' },
      });

      return updatedTrip;
    });
  }

  // TRANSACTION: Complete Trip
  async completeTrip(tripId, vehicleId, driverId, actualDistance, actualEndTime, completedByUserId) {
    return prisma.$transaction(async (tx) => {
      // 1. Update Trip
      const updatedTrip = await tx.trip.update({
        where: { id: tripId },
        data: {
          status: 'COMPLETED',
          actualDistance,
          endTime: actualEndTime,
          completedByUserId,
        },
      });

      // 2. Release Vehicle & Update Odometer
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: {
          status: 'AVAILABLE',
          odometer: { increment: actualDistance },
        },
      });

      // 3. Release Driver
      await tx.driver.update({
        where: { id: driverId },
        data: { status: 'AVAILABLE' },
      });

      return updatedTrip;
    });
  }

  // TRANSACTION: Cancel Trip
  async cancelTrip(tripId, vehicleId, driverId, tripCurrentStatus) {
    return prisma.$transaction(async (tx) => {
      // 1. Cancel Trip
      const updatedTrip = await tx.trip.update({
        where: { id: tripId },
        data: { status: 'CANCELLED' },
      });

      // 2. Only release resources if they were locked
      if (['DISPATCHED', 'IN_PROGRESS'].includes(tripCurrentStatus)) {
        await tx.vehicle.update({
          where: { id: vehicleId },
          data: { status: 'AVAILABLE' },
        });

        await tx.driver.update({
          where: { id: driverId },
          data: { status: 'AVAILABLE' },
        });
      }

      return updatedTrip;
    });
  }
}

module.exports = new TripRepository();
