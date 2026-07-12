const prisma = require('../config/prisma');

class DashboardRepository {
  // ---------------------------------------------------------
  // KPIs
  // ---------------------------------------------------------

  async getVehicleKPIs() {
    const totalVehicles = await prisma.vehicle.count({
      where: { isDeleted: false }
    });

    const statusGroups = await prisma.vehicle.groupBy({
      by: ['status'],
      _count: { id: true },
      where: { isDeleted: false }
    });

    let available = 0, onTrip = 0, inShop = 0;
    for (const group of statusGroups) {
      if (group.status === 'AVAILABLE') available += group._count.id;
      else if (group.status === 'ON_TRIP') onTrip += group._count.id;
      else if (group.status === 'IN_SHOP' || group.status === 'MAINTENANCE') inShop += group._count.id;
    }

    return { totalVehicles, available, onTrip, inShop };
  }

  async getDriverKPIs() {
    const totalDrivers = await prisma.driver.count({
      where: { isDeleted: false }
    });

    const statusGroups = await prisma.driver.groupBy({
      by: ['status'],
      _count: { id: true },
      where: { isDeleted: false }
    });

    let available = 0;
    for (const group of statusGroups) {
      if (group.status === 'AVAILABLE') available += group._count.id;
    }

    return { totalDrivers, available };
  }

  async getTripKPIs(startDate, endDate) {
    const statusGroups = await prisma.trip.groupBy({
      by: ['status'],
      _count: { id: true },
      where: { 
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    let total = 0, active = 0, completed = 0, cancelled = 0;
    for (const group of statusGroups) {
      total += group._count.id;
      if (group.status === 'IN_PROGRESS') active += group._count.id;
      else if (group.status === 'COMPLETED') completed += group._count.id;
      else if (group.status === 'CANCELLED') cancelled += group._count.id;
    }

    return { total, active, completed, cancelled };
  }

  async getMaintenanceKPIs(startDate, endDate) {
    const statusGroups = await prisma.maintenance.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { actualCost: true },
      where: { 
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    let pending = 0, inProgress = 0, totalCost = 0;
    for (const group of statusGroups) {
      if (['REQUESTED', 'SCHEDULED'].includes(group.status)) {
        pending += group._count.id;
      } else if (group.status === 'IN_PROGRESS') {
        inProgress += group._count.id;
      } else if (group.status === 'COMPLETED') {
        totalCost += (group._sum.actualCost || 0);
      }
    }

    return { pending, inProgress, totalCost };
  }

  async getFuelKPIs(startDate, endDate) {
    const stats = await prisma.fuelLog.aggregate({
      _sum: { totalCost: true, liters: true },
      where: {
        status: 'APPROVED',
        isDeleted: false,
        filledAt: { gte: startDate, lte: endDate }
      }
    });

    return {
      totalCost: stats._sum.totalCost || 0,
      totalLiters: stats._sum.liters || 0
    };
  }

  async getExpenseKPIs(startDate, endDate) {
    const stats = await prisma.expense.aggregate({
      _sum: { amount: true },
      where: {
        status: { in: ['APPROVED', 'PENDING_PAYMENT', 'PROCESSING_PAYMENT', 'PAID'] },
        isDeleted: false,
        date: { gte: startDate, lte: endDate }
      }
    });

    return {
      totalCost: stats._sum.amount || 0
    };
  }

  // ---------------------------------------------------------
  // CHARTS
  // ---------------------------------------------------------

  async getTripCharts(startDate, endDate) {
    const dailyTrips = await prisma.trip.groupBy({
      by: ['status'], // To do actual daily grouped by date in Prisma requires raw queries usually, so we fetch raw dates for charting or group by status.
      _count: { id: true },
      where: { createdAt: { gte: startDate, lte: endDate } }
    });
    return { dailyTrips };
  }

  async getFuelCharts(startDate, endDate, take = 10) {
    const topFuelVehicles = await prisma.fuelLog.groupBy({
      by: ['vehicleId'],
      _sum: { totalCost: true, liters: true },
      where: { status: 'APPROVED', isDeleted: false, filledAt: { gte: startDate, lte: endDate } },
      orderBy: { _sum: { totalCost: 'desc' } },
      take
    });

    return { topFuelVehicles };
  }

  async getMaintenanceCharts(startDate, endDate, take = 10) {
    const maintenanceByVehicle = await prisma.maintenance.groupBy({
      by: ['vehicleId'],
      _sum: { actualCost: true },
      _count: { id: true },
      where: { status: 'COMPLETED', createdAt: { gte: startDate, lte: endDate } },
      orderBy: { _sum: { actualCost: 'desc' } },
      take
    });

    return { maintenanceByVehicle };
  }

  async getExpenseCharts(startDate, endDate) {
    const expensesByCategory = await prisma.expense.groupBy({
      by: ['type'],
      _sum: { amount: true },
      where: { 
        status: { in: ['APPROVED', 'PENDING_PAYMENT', 'PROCESSING_PAYMENT', 'PAID'] }, 
        isDeleted: false, 
        date: { gte: startDate, lte: endDate } 
      }
    });

    return { expensesByCategory };
  }

  async getFleetCharts() {
    // Current fleet distribution
    const vehiclesByType = await prisma.vehicle.groupBy({
      by: ['type'],
      _count: { id: true },
      where: { isDeleted: false }
    });

    return { vehiclesByType };
  }

  // ---------------------------------------------------------
  // AGGREGATE COMPUTATIONS
  // ---------------------------------------------------------

  async getAnalytics(startDate, endDate) {
    // Distance tracked via trips
    const tripDistances = await prisma.trip.aggregate({
      _sum: { actualDistance: true },
      where: { status: 'COMPLETED', createdAt: { gte: startDate, lte: endDate } }
    });
    
    const totalDistance = tripDistances._sum.actualDistance || 0;

    return { totalDistance };
  }
}

module.exports = new DashboardRepository();
