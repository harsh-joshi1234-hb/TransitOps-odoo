const settingService = require('../services/setting.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class SettingController {
  getAllSettings = asyncHandler(async (req, res) => {
    const data = await settingService.getAllSettings(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Settings retrieved successfully'));
  });

  getSettingByKey = asyncHandler(async (req, res) => {
    const data = await settingService.getSettingByKey(req.params.key);
    res.status(200).json(new ApiResponse(200, data, 'Setting retrieved successfully'));
  });

  createSetting = asyncHandler(async (req, res) => {
    const data = await settingService.createSetting(req.body);
    res.status(201).json(new ApiResponse(201, data, 'Setting created successfully'));
  });

  updateSetting = asyncHandler(async (req, res) => {
    const data = await settingService.updateSetting(req.params.key, req.body);
    res.status(200).json(new ApiResponse(200, data, 'Setting updated successfully'));
  });

  deleteSetting = asyncHandler(async (req, res) => {
    await settingService.deleteSetting(req.params.key);
    res.status(200).json(new ApiResponse(200, null, 'Setting deleted successfully'));
  });
}

module.exports = new SettingController();
