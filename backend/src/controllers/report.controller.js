const reportService = require('../services/report.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class ReportController {
  getFleetReport = asyncHandler(async (req, res) => {
    const data = await reportService.getFleetReport(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Fleet report retrieved successfully'));
  });

  getDriverReport = asyncHandler(async (req, res) => {
    const data = await reportService.getDriverReport(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Driver report retrieved successfully'));
  });

  getTripReport = asyncHandler(async (req, res) => {
    const data = await reportService.getTripReport(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Trip report retrieved successfully'));
  });

  getMaintenanceReport = asyncHandler(async (req, res) => {
    const data = await reportService.getMaintenanceReport(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Maintenance report retrieved successfully'));
  });

  getFuelReport = asyncHandler(async (req, res) => {
    const data = await reportService.getFuelReport(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Fuel report retrieved successfully'));
  });

  getExpenseReport = asyncHandler(async (req, res) => {
    const data = await reportService.getExpenseReport(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Expense report retrieved successfully'));
  });

  getFinancialSummary = asyncHandler(async (req, res) => {
    const data = await reportService.getFinancialSummary(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Financial summary retrieved successfully'));
  });

  getExecutiveSummary = asyncHandler(async (req, res) => {
    const data = await reportService.getExecutiveSummary(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Executive summary retrieved successfully'));
  });
}

module.exports = new ReportController();
