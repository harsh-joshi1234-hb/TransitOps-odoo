const reportRepository = require('../repositories/report.repository');

class ReportService {
  _getStandardParams(query) {
    const filters = {};
    if (query.vehicleId) filters.vehicleId = query.vehicleId;
    if (query.driverId) filters.driverId = query.driverId;
    if (query.tripId) filters.tripId = query.tripId;
    if (query.maintenanceId) filters.maintenanceId = query.maintenanceId;
    if (query.status) filters.status = query.status;
    if (query.category) filters.type = query.category;

    const start = query.startDate ? new Date(query.startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = query.endDate ? new Date(new Date(query.endDate).setUTCHours(23, 59, 59, 999)) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);
    
    filters.createdAt = { gte: start, lte: end };

    const page = parseInt(query.page, 10) || 1;
    const limit = Math.min(Number(query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    return { filters, page, limit, skip, take: limit, sortBy, sortOrder, start, end };
  }

  // Uses 'date' instead of 'createdAt' for expenses
  _getExpenseFilters(query) {
    const params = this._getStandardParams(query);
    if (params.filters.createdAt) {
      params.filters.date = params.filters.createdAt;
      delete params.filters.createdAt;
    }
    return params;
  }

  // Uses 'filledAt' instead of 'createdAt' for fuel
  _getFuelFilters(query) {
    const params = this._getStandardParams(query);
    if (params.filters.createdAt) {
      params.filters.filledAt = params.filters.createdAt;
      delete params.filters.createdAt;
    }
    if (params.filters.type) {
      params.filters.fuelType = params.filters.type;
      delete params.filters.type;
    }
    return params;
  }

  async getFleetReport(query) {
    const { filters, page, limit, skip, take, sortBy, sortOrder, start, end } = this._getStandardParams(query);
    // Overwrite createdAt filtering for vehicles since we just want current status
    delete filters.createdAt;

    const [aggregations, [list, total]] = await Promise.all([
      reportRepository.aggregateVehicles(filters),
      reportRepository.getVehicleList({ filters, skip, take, sortBy, sortOrder })
    ]);

    let available = 0, onTrip = 0, inShop = 0;
    for (const group of aggregations) {
      if (group.status === 'AVAILABLE') available += group._count.id;
      else if (group.status === 'ON_TRIP') onTrip += group._count.id;
      else if (['IN_SHOP', 'MAINTENANCE'].includes(group.status)) inShop += group._count.id;
    }

    return {
      summary: { total: total, available, onTrip, inShop },
      tables: { vehicles: list },
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), sortBy, sortOrder, timeRange: { start, end } }
    };
  }

  async getDriverReport(query) {
    const { filters, page, limit, skip, take, sortBy, sortOrder, start, end } = this._getStandardParams(query);
    delete filters.createdAt;

    const [aggregations, [list, total]] = await Promise.all([
      reportRepository.aggregateDrivers(filters),
      reportRepository.getDriverList({ filters, skip, take, sortBy, sortOrder })
    ]);

    let available = 0, onTrip = 0, offDuty = 0;
    for (const group of aggregations.statusGroups) {
      if (group.status === 'AVAILABLE') available += group._count.id;
      else if (group.status === 'ON_TRIP') onTrip += group._count.id;
      else if (group.status === 'OFF_DUTY') offDuty += group._count.id;
    }

    return {
      summary: { total: total, available, onTrip, offDuty, avgSafetyScore: aggregations.avgSafetyScore || 0 },
      tables: { drivers: list },
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), sortBy, sortOrder, timeRange: { start, end } }
    };
  }

  async getTripReport(query) {
    const { filters, page, limit, skip, take, sortBy, sortOrder, start, end } = this._getStandardParams(query);
    const [aggregations, [list, total]] = await Promise.all([
      reportRepository.aggregateTrips(filters),
      reportRepository.getTripList({ filters, skip, take, sortBy, sortOrder })
    ]);

    return {
      summary: aggregations,
      tables: { trips: list },
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), sortBy, sortOrder, timeRange: { start, end } }
    };
  }

  async getMaintenanceReport(query) {
    const { filters, page, limit, skip, take, sortBy, sortOrder, start, end } = this._getStandardParams(query);
    const [aggregations, [list, total]] = await Promise.all([
      reportRepository.aggregateMaintenance(filters),
      reportRepository.getMaintenanceList({ filters, skip, take, sortBy, sortOrder })
    ]);

    return {
      summary: aggregations,
      tables: { maintenanceLogs: list },
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), sortBy, sortOrder, timeRange: { start, end } }
    };
  }

  async getFuelReport(query) {
    const { filters, page, limit, skip, take, sortBy, sortOrder, start, end } = this._getFuelFilters(query);
    const [aggregations, [list, total]] = await Promise.all([
      reportRepository.aggregateFuel(filters),
      reportRepository.getFuelList({ filters, skip, take, sortBy, sortOrder })
    ]);

    return {
      summary: aggregations,
      tables: { fuelLogs: list },
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), sortBy, sortOrder, timeRange: { start, end } }
    };
  }

  async getExpenseReport(query) {
    const { filters, page, limit, skip, take, sortBy, sortOrder, start, end } = this._getExpenseFilters(query);
    const [aggregations, [list, total]] = await Promise.all([
      reportRepository.aggregateExpenses(filters),
      reportRepository.getExpenseList({ filters, skip, take, sortBy, sortOrder })
    ]);

    return {
      summary: aggregations,
      tables: { expenses: list },
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), sortBy, sortOrder, timeRange: { start, end } }
    };
  }

  async getFinancialSummary(query) {
    const fuelParams = this._getFuelFilters(query);
    const expenseParams = this._getExpenseFilters(query);
    const maintenanceParams = this._getStandardParams(query);

    // Lock to APPROVED/COMPLETED records
    fuelParams.filters.status = 'APPROVED';
    expenseParams.filters.status = { in: ['APPROVED', 'PENDING_PAYMENT', 'PROCESSING_PAYMENT', 'PAID'] };
    maintenanceParams.filters.status = 'COMPLETED';

    const [fuelAgg, expenseAgg, maintAgg] = await Promise.all([
      reportRepository.aggregateFuel(fuelParams.filters),
      reportRepository.aggregateExpenses(expenseParams.filters),
      reportRepository.aggregateMaintenance(maintenanceParams.filters)
    ]);

    const totalFuelCost = fuelAgg.totalCost || 0;
    const totalExpenseAmount = expenseAgg.totalAmount || 0;
    const totalMaintenanceCost = maintAgg.totalActualCost || 0;
    const totalOperatingCost = totalFuelCost + totalExpenseAmount + totalMaintenanceCost;

    return {
      summary: {
        totalOperatingCost,
        breakdown: {
          fuel: totalFuelCost,
          maintenance: totalMaintenanceCost,
          expenses: totalExpenseAmount
        }
      },
      charts: {
        expenseByCategory: expenseAgg.typeGroups,
        maintenanceByType: maintAgg.typeGroups
      },
      meta: { timeRange: { start: fuelParams.start, end: fuelParams.end } }
    };
  }

  async getExecutiveSummary(query) {
    const [fleet, driver, trip, finance] = await Promise.all([
      this.getFleetReport(query),
      this.getDriverReport(query),
      this.getTripReport(query),
      this.getFinancialSummary(query)
    ]);

    return {
      summary: {
        fleet: fleet.summary,
        driver: driver.summary,
        trip: {
          totalTrips: trip.summary.totalTrips,
          totalDistance: trip.summary.totalActualDistance
        },
        finance: finance.summary
      },
      meta: { timeRange: { start: query.startDate ? new Date(query.startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1), end: query.endDate ? new Date(new Date(query.endDate).setUTCHours(23, 59, 59, 999)) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999) } }
    };
  }
}

module.exports = new ReportService();
