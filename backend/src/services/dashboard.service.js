const dashboardRepository = require('../repositories/dashboard.repository');

class DashboardService {
  _getQueryParams(query) {
    const start = query.startDate ? new Date(query.startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = query.endDate ? new Date(query.endDate) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);
    
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const take = limit;
    
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    return { start, end, page, limit, skip, take, sortBy, sortOrder };
  }

  async getOverview(query) {
    const { start, end, page, limit, skip, take, sortBy, sortOrder } = this._getQueryParams(query);

    // Parallel Aggregation
    const [
      vehicleKPIs,
      driverKPIs,
      tripKPIs,
      maintenanceKPIs,
      fuelKPIs,
      expenseKPIs
    ] = await Promise.all([
      dashboardRepository.getVehicleKPIs(),
      dashboardRepository.getDriverKPIs(),
      dashboardRepository.getTripKPIs(start, end),
      dashboardRepository.getMaintenanceKPIs(start, end),
      dashboardRepository.getFuelKPIs(start, end),
      dashboardRepository.getExpenseKPIs(start, end)
    ]);

    return {
      vehicles: vehicleKPIs,
      drivers: driverKPIs,
      trips: tripKPIs,
      maintenance: maintenanceKPIs,
      fuel: fuelKPIs,
      expense: expenseKPIs,
      meta: { timeRange: { start, end }, page, limit, sortBy, sortOrder }
    };
  }

  async getCharts(query) {
    const { start, end, page, limit, skip, take, sortBy, sortOrder } = this._getQueryParams(query);

    const [
      tripCharts,
      fuelCharts,
      maintenanceCharts,
      expenseCharts,
      fleetCharts
    ] = await Promise.all([
      dashboardRepository.getTripCharts(start, end),
      dashboardRepository.getFuelCharts(start, end),
      dashboardRepository.getMaintenanceCharts(start, end),
      dashboardRepository.getExpenseCharts(start, end),
      dashboardRepository.getFleetCharts()
    ]);

    return {
      trips: tripCharts,
      fuel: fuelCharts,
      maintenance: maintenanceCharts,
      expenses: expenseCharts,
      fleet: fleetCharts,
      meta: { timeRange: { start, end }, page, limit, sortBy, sortOrder }
    };
  }

  async getFleet(query) {
    const { start, end, page, limit, skip, take, sortBy, sortOrder } = this._getQueryParams(query);
    const [vehicles, fleetCharts] = await Promise.all([
      dashboardRepository.getVehicleKPIs(),
      dashboardRepository.getFleetCharts()
    ]);
    return { vehicles, fleetCharts, meta: { timeRange: { start, end }, page, limit, sortBy, sortOrder } };
  }

  async getTrips(query) {
    const { start, end, page, limit, skip, take, sortBy, sortOrder } = this._getQueryParams(query);
    const [trips, tripCharts] = await Promise.all([
      dashboardRepository.getTripKPIs(start, end),
      dashboardRepository.getTripCharts(start, end)
    ]);
    return { trips, tripCharts, meta: { timeRange: { start, end }, page, limit, sortBy, sortOrder } };
  }

  async getMaintenance(query) {
    const { start, end, page, limit, skip, take, sortBy, sortOrder } = this._getQueryParams(query);
    const [maintenance, maintenanceCharts] = await Promise.all([
      dashboardRepository.getMaintenanceKPIs(start, end),
      dashboardRepository.getMaintenanceCharts(start, end, take)
    ]);
    return { maintenance, maintenanceCharts, meta: { timeRange: { start, end }, page, limit, sortBy, sortOrder } };
  }

  async getFuel(query) {
    const { start, end, page, limit, skip, take, sortBy, sortOrder } = this._getQueryParams(query);
    const [fuel, fuelCharts] = await Promise.all([
      dashboardRepository.getFuelKPIs(start, end),
      dashboardRepository.getFuelCharts(start, end, take)
    ]);
    return { fuel, fuelCharts, meta: { timeRange: { start, end }, page, limit, sortBy, sortOrder } };
  }

  async getExpenses(query) {
    const { start, end, page, limit, skip, take, sortBy, sortOrder } = this._getQueryParams(query);
    const [expenses, expenseCharts] = await Promise.all([
      dashboardRepository.getExpenseKPIs(start, end),
      dashboardRepository.getExpenseCharts(start, end)
    ]);
    return { expenses, expenseCharts, meta: { timeRange: { start, end }, page, limit, sortBy, sortOrder } };
  }

  async getAnalytics(query) {
    const { start, end, page, limit, skip, take, sortBy, sortOrder } = this._getQueryParams(query);
    
    // Aggregating required data to compute advanced CPK and Efficiency metrics
    const [
      fuelKPIs,
      maintenanceKPIs,
      expenseKPIs,
      analyticsData
    ] = await Promise.all([
      dashboardRepository.getFuelKPIs(start, end),
      dashboardRepository.getMaintenanceKPIs(start, end),
      dashboardRepository.getExpenseKPIs(start, end),
      dashboardRepository.getAnalytics(start, end)
    ]);

    const totalDistance = analyticsData.totalDistance || 0;
    const totalCost = fuelKPIs.totalCost + maintenanceKPIs.totalCost + expenseKPIs.totalCost;
    
    const costPerKm = totalDistance > 0 ? parseFloat((totalCost / totalDistance).toFixed(2)) : 0;
    const fuelEfficiency = totalDistance > 0 ? parseFloat((fuelKPIs.totalLiters / (totalDistance / 100)).toFixed(2)) : 0; // Liters per 100km

    return {
      totalDistance,
      totalCost,
      costPerKm,
      fuelEfficiency,
      meta: { timeRange: { start, end }, page, limit, sortBy, sortOrder }
    };
  }
}

module.exports = new DashboardService();
