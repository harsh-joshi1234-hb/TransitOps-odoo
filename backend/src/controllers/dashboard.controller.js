const dashboardService = require('../services/dashboard.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class DashboardController {
  getOverview = asyncHandler(async (req, res) => {
    const data = await dashboardService.getOverview(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Dashboard overview retrieved successfully'));
  });

  getCharts = asyncHandler(async (req, res) => {
    const data = await dashboardService.getCharts(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Dashboard charts retrieved successfully'));
  });

  getFleet = asyncHandler(async (req, res) => {
    const data = await dashboardService.getFleet(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Fleet dashboard data retrieved successfully'));
  });

  getTrips = asyncHandler(async (req, res) => {
    const data = await dashboardService.getTrips(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Trips dashboard data retrieved successfully'));
  });

  getMaintenance = asyncHandler(async (req, res) => {
    const data = await dashboardService.getMaintenance(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Maintenance dashboard data retrieved successfully'));
  });

  getFuel = asyncHandler(async (req, res) => {
    const data = await dashboardService.getFuel(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Fuel dashboard data retrieved successfully'));
  });

  getExpenses = asyncHandler(async (req, res) => {
    const data = await dashboardService.getExpenses(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Expense dashboard data retrieved successfully'));
  });

  getAnalytics = asyncHandler(async (req, res) => {
    const data = await dashboardService.getAnalytics(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Advanced analytics retrieved successfully'));
  });
}

module.exports = new DashboardController();
