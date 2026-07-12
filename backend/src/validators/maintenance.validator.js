const ApiError = require('../utils/apiError');

const VALID_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'];
const VALID_TYPES = ['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY', 'INSPECTION', 'ROUTINE_SERVICE'];

const validateCreateMaintenance = (req, res, next) => {
  const { maintenanceType, priority, description, vehicleId } = req.body;
  const errors = [];

  if (!maintenanceType || !VALID_TYPES.includes(maintenanceType)) {
    errors.push(`maintenanceType must be one of: ${VALID_TYPES.join(', ')}`);
  }

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (!description || typeof description !== 'string') errors.push('Valid description is required');
  if (!vehicleId || typeof vehicleId !== 'string') errors.push('Valid vehicleId is required');

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join('. ')));
  }

  next();
};

const validateUpdateMaintenance = (req, res, next) => {
  const { priority, description, estimatedCost } = req.body;
  const errors = [];

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (description !== undefined && typeof description !== 'string') errors.push('description must be a string');
  if (estimatedCost !== undefined && (typeof estimatedCost !== 'number' || estimatedCost < 0)) {
    errors.push('estimatedCost must be a positive number');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join('. ')));
  }

  next();
};

module.exports = {
  validateCreateMaintenance,
  validateUpdateMaintenance,
};
