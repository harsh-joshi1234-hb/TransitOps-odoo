const prisma = require('../config/prisma');

class ReportRepository {
  // ------------------------------------------------------------------
  // LIST DATA (Paginated + Select)
  // ------------------------------------------------------------------

  async getVehicleList({ filters, skip, take, sortBy, sortOrder }) {
    const where = { isDeleted: false, ...filters };
    return Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take,
        orderBy: sortBy ? { [sortBy]: sortOrder } : undefined,
        select: { id: true, registrationNumber: true, name: true, type: true, status: true, currentOdometer: true }
      }),
      prisma.vehicle.count({ where })
    ]);
  }

  async getDriverList({ filters, skip, take, sortBy, sortOrder }) {
    const where = { isDeleted: false, ...filters };
    return Promise.all([
      prisma.driver.findMany({
        where,
        skip,
        take,
        orderBy: sortBy ? { [sortBy]: sortOrder } : undefined,
        select: { id: true, firstName: true, lastName: true, licenseNumber: true, safetyScore: true, status: true }
      }),
      prisma.driver.count({ where })
    ]);
  }

  async getTripList({ filters, skip, take, sortBy, sortOrder }) {
    return Promise.all([
      prisma.trip.findMany({
        where: filters,
        skip,
        take,
        orderBy: sortBy ? { [sortBy]: sortOrder } : undefined,
        select: { id: true, tripNumber: true, status: true, plannedDistance: true, actualDistance: true, createdAt: true, vehicleId: true, driverId: true }
      }),
      prisma.trip.count({ where: filters })
    ]);
  }

  async getMaintenanceList({ filters, skip, take, sortBy, sortOrder }) {
    return Promise.all([
      prisma.maintenance.findMany({
        where: filters,
        skip,
        take,
        orderBy: sortBy ? { [sortBy]: sortOrder } : undefined,
        select: { id: true, maintenanceNumber: true, maintenanceType: true, status: true, estimatedCost: true, actualCost: true, serviceDate: true, vehicleId: true }
      }),
      prisma.maintenance.count({ where: filters })
    ]);
  }

  async getFuelList({ filters, skip, take, sortBy, sortOrder }) {
    const where = { isDeleted: false, ...filters };
    return Promise.all([
      prisma.fuelLog.findMany({
        where,
        skip,
        take,
        orderBy: sortBy ? { [sortBy]: sortOrder } : undefined,
        select: { id: true, fuelLogNumber: true, fuelType: true, liters: true, totalCost: true, status: true, filledAt: true, vehicleId: true }
      }),
      prisma.fuelLog.count({ where })
    ]);
  }

  async getExpenseList({ filters, skip, take, sortBy, sortOrder }) {
    const where = { isDeleted: false, ...filters };
    return Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take,
        orderBy: sortBy ? { [sortBy]: sortOrder } : undefined,
        select: { id: true, expenseNumber: true, type: true, amount: true, status: true, date: true, vehicleId: true, tripId: true, maintenanceId: true }
      }),
      prisma.expense.count({ where })
    ]);
  }

  // ------------------------------------------------------------------
  // AGGREGATIONS (No findMany allowed)
  // ------------------------------------------------------------------

  async aggregateVehicles(filters = {}) {
    const where = { isDeleted: false, ...filters };
    const statusGroups = await prisma.vehicle.groupBy({
      by: ['status'],
      _count: { id: true },
      where
    });
    return statusGroups;
  }

  async aggregateDrivers(filters = {}) {
    const where = { isDeleted: false, ...filters };
    const scoreAvg = await prisma.driver.aggregate({
      _avg: { safetyScore: true },
      where
    });
    const statusGroups = await prisma.driver.groupBy({
      by: ['status'],
      _count: { id: true },
      where
    });
    return { avgSafetyScore: scoreAvg._avg.safetyScore, statusGroups };
  }

  async aggregateTrips(filters) {
    const stats = await prisma.trip.aggregate({
      _count: { id: true },
      _sum: { plannedDistance: true, actualDistance: true },
      where: filters
    });

    const statusGroups = await prisma.trip.groupBy({
      by: ['status'],
      _count: { id: true },
      where: filters
    });

    return {
      totalTrips: stats._count.id,
      totalPlannedDistance: stats._sum.plannedDistance,
      totalActualDistance: stats._sum.actualDistance,
      statusGroups
    };
  }

  async aggregateMaintenance(filters) {
    const stats = await prisma.maintenance.aggregate({
      _count: { id: true },
      _sum: { estimatedCost: true, actualCost: true },
      where: filters
    });

    const typeGroups = await prisma.maintenance.groupBy({
      by: ['maintenanceType'],
      _sum: { actualCost: true },
      where: filters
    });

    return {
      totalLogs: stats._count.id,
      totalEstimatedCost: stats._sum.estimatedCost,
      totalActualCost: stats._sum.actualCost,
      typeGroups
    };
  }

  async aggregateFuel(filters) {
    const where = { isDeleted: false, ...filters };
    const stats = await prisma.fuelLog.aggregate({
      _count: { id: true },
      _sum: { liters: true, totalCost: true },
      where
    });
    return {
      totalLogs: stats._count.id,
      totalLiters: stats._sum.liters,
      totalCost: stats._sum.totalCost
    };
  }

  async aggregateExpenses(filters) {
    const where = { isDeleted: false, ...filters };
    const stats = await prisma.expense.aggregate({
      _count: { id: true },
      _sum: { amount: true },
      where
    });

    const typeGroups = await prisma.expense.groupBy({
      by: ['type'],
      _sum: { amount: true },
      where
    });

    return {
      totalClaims: stats._count.id,
      totalAmount: stats._sum.amount,
      typeGroups
    };
  }
}

module.exports = new ReportRepository();
