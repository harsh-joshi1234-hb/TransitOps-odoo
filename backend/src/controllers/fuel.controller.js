const fuelService = require('../services/fuel.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class FuelController {
  createFuelLog = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const fuelLog = await fuelService.createFuelLog(req.body, userId);
    res.status(201).json(new ApiResponse(201, fuelLog, 'Fuel log drafted successfully'));
  });

  getFuelLogById = asyncHandler(async (req, res) => {
    const fuelLog = await fuelService.getFuelLogById(req.params.id);
    res.status(200).json(new ApiResponse(200, fuelLog, 'Fuel log retrieved successfully'));
  });

  getAllFuelLogs = asyncHandler(async (req, res) => {
    const data = await fuelService.getAllFuelLogs(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Fuel logs retrieved successfully'));
  });

  updateFuelLog = asyncHandler(async (req, res) => {
    const fuelLog = await fuelService.updateFuelLog(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, fuelLog, 'Fuel log updated successfully'));
  });

  submitFuelLog = asyncHandler(async (req, res) => {
    const fuelLog = await fuelService.submitFuelLog(req.params.id);
    res.status(200).json(new ApiResponse(200, fuelLog, 'Fuel log submitted successfully'));
  });

  approveFuelLog = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const fuelLog = await fuelService.approveFuelLog(req.params.id, userId);
    res.status(200).json(new ApiResponse(200, fuelLog, 'Fuel log approved successfully'));
  });

  rejectFuelLog = asyncHandler(async (req, res) => {
    const fuelLog = await fuelService.rejectFuelLog(req.params.id);
    res.status(200).json(new ApiResponse(200, fuelLog, 'Fuel log rejected successfully'));
  });

  deleteFuelLog = asyncHandler(async (req, res) => {
    const fuelLog = await fuelService.softDeleteFuelLog(req.params.id);
    res.status(200).json(new ApiResponse(200, fuelLog, 'Fuel log deleted successfully'));
  });

  getTimeline = asyncHandler(async (req, res) => {
    const timeline = await fuelService.getTimeline(req.params.id);
    res.status(200).json(new ApiResponse(200, timeline, 'Fuel log timeline retrieved successfully'));
  });

  getVehicleFuelLogs = asyncHandler(async (req, res) => {
    req.query.vehicleId = req.params.vehicleId;
    const data = await fuelService.getAllFuelLogs(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Vehicle fuel logs retrieved successfully'));
  });

  getTripFuelLogs = asyncHandler(async (req, res) => {
    req.query.tripId = req.params.tripId;
    const data = await fuelService.getAllFuelLogs(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Trip fuel logs retrieved successfully'));
  });
}

module.exports = new FuelController();
