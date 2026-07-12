const ApiError = require('../utils/apiError');

const VALID_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

const validateCreateTrip = (req, res, next) => {
  const { source, destination, cargoWeight, plannedDistance, priority, plannedStartTime, plannedEndTime, vehicleId, driverId } = req.body;
  const errors = [];

  if (!source || typeof source !== 'string') errors.push('Valid source is required');
  if (!destination || typeof destination !== 'string') errors.push('Valid destination is required');
  if (cargoWeight === undefined || typeof cargoWeight !== 'number' || cargoWeight <= 0) errors.push('Valid positive cargoWeight is required');
  if (plannedDistance === undefined || typeof plannedDistance !== 'number' || plannedDistance <= 0) errors.push('Valid positive plannedDistance is required');
  
  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (plannedStartTime && isNaN(new Date(plannedStartTime).getTime())) {
    errors.push('plannedStartTime must be a valid ISO date');
  }

  if (plannedEndTime && isNaN(new Date(plannedEndTime).getTime())) {
    errors.push('plannedEndTime must be a valid ISO date');
  }

  if (plannedStartTime && plannedEndTime && new Date(plannedStartTime) > new Date(plannedEndTime)) {
    errors.push('plannedStartTime must be before plannedEndTime');
  }

  if (!vehicleId || typeof vehicleId !== 'string') errors.push('Valid vehicleId is required');
  if (!driverId || typeof driverId !== 'string') errors.push('Valid driverId is required');

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join('. ')));
  }

  next();
};

const validateUpdateTrip = (req, res, next) => {
  const { source, destination, cargoWeight, plannedDistance, priority, plannedStartTime, plannedEndTime, vehicleId, driverId } = req.body;
  const errors = [];

  if (source !== undefined && typeof source !== 'string') errors.push('source must be a string');
  if (destination !== undefined && typeof destination !== 'string') errors.push('destination must be a string');
  if (cargoWeight !== undefined && (typeof cargoWeight !== 'number' || cargoWeight <= 0)) errors.push('cargoWeight must be a positive number');
  if (plannedDistance !== undefined && (typeof plannedDistance !== 'number' || plannedDistance <= 0)) errors.push('plannedDistance must be a positive number');
  
  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (plannedStartTime !== undefined && isNaN(new Date(plannedStartTime).getTime())) errors.push('plannedStartTime must be a valid ISO date');
  if (plannedEndTime !== undefined && isNaN(new Date(plannedEndTime).getTime())) errors.push('plannedEndTime must be a valid ISO date');

  if (vehicleId !== undefined && typeof vehicleId !== 'string') errors.push('vehicleId must be a string');
  if (driverId !== undefined && typeof driverId !== 'string') errors.push('driverId must be a string');

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join('. ')));
  }

  next();
};

module.exports = {
  validateCreateTrip,
  validateUpdateTrip,
};
