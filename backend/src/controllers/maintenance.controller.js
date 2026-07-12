const maintenanceService = require('../services/maintenance.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class MaintenanceController {
  createMaintenance = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const maintenance = await maintenanceService.createMaintenance(req.body, userId);
    res.status(201).json(new ApiResponse(201, maintenance, 'Maintenance requested successfully'));
  });

  getMaintenanceById = asyncHandler(async (req, res) => {
    const maintenance = await maintenanceService.getMaintenanceById(req.params.id);
    res.status(200).json(new ApiResponse(200, maintenance, 'Maintenance retrieved successfully'));
  });

  getAllMaintenance = asyncHandler(async (req, res) => {
    const data = await maintenanceService.getAllMaintenance(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Maintenance logs retrieved successfully'));
  });

  updateMaintenance = asyncHandler(async (req, res) => {
    const maintenance = await maintenanceService.updateMaintenance(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, maintenance, 'Maintenance updated successfully'));
  });

  scheduleMaintenance = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const maintenance = await maintenanceService.scheduleMaintenance(req.params.id, req.body, userId);
    res.status(200).json(new ApiResponse(200, maintenance, 'Maintenance scheduled successfully'));
  });

  startMaintenance = asyncHandler(async (req, res) => {
    const { currentOdometer } = req.body;
    const maintenance = await maintenanceService.startMaintenance(req.params.id, currentOdometer);
    res.status(200).json(new ApiResponse(200, maintenance, 'Maintenance started successfully'));
  });

  completeMaintenance = asyncHandler(async (req, res) => {
    const { actualCost, nextServiceDate } = req.body;
    const userId = req.user.id;
    const maintenance = await maintenanceService.completeMaintenance(req.params.id, actualCost, nextServiceDate, userId);
    res.status(200).json(new ApiResponse(200, maintenance, 'Maintenance completed successfully'));
  });

  cancelMaintenance = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const maintenance = await maintenanceService.cancelMaintenance(req.params.id, userId);
    res.status(200).json(new ApiResponse(200, maintenance, 'Maintenance cancelled successfully'));
  });

  getTimeline = asyncHandler(async (req, res) => {
    const timeline = await maintenanceService.getTimeline(req.params.id);
    res.status(200).json(new ApiResponse(200, timeline, 'Maintenance timeline retrieved successfully'));
  });
}

module.exports = new MaintenanceController();
