const vehicleService = require('../services/vehicle.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class VehicleController {
  createVehicle = asyncHandler(async (req, res) => {
    const vehicle = await vehicleService.createVehicle(req.body);
    res.status(201).json(new ApiResponse(201, vehicle, 'Vehicle created successfully'));
  });

  getVehicleById = asyncHandler(async (req, res) => {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    res.status(200).json(new ApiResponse(200, vehicle, 'Vehicle retrieved successfully'));
  });

  getAllVehicles = asyncHandler(async (req, res) => {
    // Parse 'isDeleted' specifically for soft-delete queries (default false handled in service/repo)
    if (req.query.isDeleted === 'true') {
      req.query.isDeleted = true;
    } else if (req.query.isDeleted === 'false') {
      req.query.isDeleted = false;
    } else {
      delete req.query.isDeleted; // Rely on service defaults if not explicitly requested
    }

    const data = await vehicleService.getAllVehicles(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Vehicles retrieved successfully'));
  });

  updateVehicle = asyncHandler(async (req, res) => {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, vehicle, 'Vehicle updated successfully'));
  });

  deleteVehicle = asyncHandler(async (req, res) => {
    const vehicle = await vehicleService.softDeleteVehicle(req.params.id);
    res.status(200).json(new ApiResponse(200, vehicle, 'Vehicle deleted successfully'));
  });

  restoreVehicle = asyncHandler(async (req, res) => {
    const vehicle = await vehicleService.restoreVehicle(req.params.id);
    res.status(200).json(new ApiResponse(200, vehicle, 'Vehicle restored successfully'));
  });
}

module.exports = new VehicleController();
