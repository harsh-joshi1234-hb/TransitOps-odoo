const driverService = require('../services/driver.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class DriverController {
  createDriver = asyncHandler(async (req, res) => {
    const driver = await driverService.createDriver(req.body);
    res.status(201).json(new ApiResponse(201, driver, 'Driver created successfully'));
  });

  getDriverById = asyncHandler(async (req, res) => {
    const driver = await driverService.getDriverById(req.params.id);
    res.status(200).json(new ApiResponse(200, driver, 'Driver retrieved successfully'));
  });

  getAllDrivers = asyncHandler(async (req, res) => {
    // Parse 'isDeleted' specifically for soft-delete queries (default false handled in service/repo)
    if (req.query.isDeleted === 'true') {
      req.query.isDeleted = true;
    } else if (req.query.isDeleted === 'false') {
      req.query.isDeleted = false;
    } else {
      delete req.query.isDeleted;
    }

    const data = await driverService.getAllDrivers(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Drivers retrieved successfully'));
  });

  updateDriver = asyncHandler(async (req, res) => {
    const driver = await driverService.updateDriver(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, driver, 'Driver updated successfully'));
  });

  updateSafetyScore = asyncHandler(async (req, res) => {
    const { safetyScore } = req.body;
    const driver = await driverService.updateSafetyScore(req.params.id, safetyScore);
    res.status(200).json(new ApiResponse(200, driver, 'Driver safety score updated successfully'));
  });

  deleteDriver = asyncHandler(async (req, res) => {
    const driver = await driverService.softDeleteDriver(req.params.id);
    res.status(200).json(new ApiResponse(200, driver, 'Driver deleted successfully'));
  });

  restoreDriver = asyncHandler(async (req, res) => {
    const driver = await driverService.restoreDriver(req.params.id);
    res.status(200).json(new ApiResponse(200, driver, 'Driver restored successfully'));
  });
}

module.exports = new DriverController();
