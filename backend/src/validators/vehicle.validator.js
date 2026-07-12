const ApiError = require('../utils/apiError');

const VALID_TYPES = ['TRUCK', 'VAN', 'REFRIGERATED', 'FLATBED', 'MINI_TRUCK', 'BUS', 'OTHER'];
const VALID_STATUSES = ['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED'];

const validateCreateVehicle = (req, res, next) => {
  const { registrationNumber, name, model, type, maxLoadCapacity, acquisitionCost, odometer, status } = req.body;
  const errors = [];

  if (!registrationNumber || typeof registrationNumber !== 'string') errors.push('Valid registrationNumber is required');
  if (!name || typeof name !== 'string') errors.push('Valid name is required');
  if (!model || typeof model !== 'string') errors.push('Valid model is required');
  
  if (!type || !VALID_TYPES.includes(type)) {
    errors.push(`Valid type is required. Must be one of: ${VALID_TYPES.join(', ')}`);
  }

  if (maxLoadCapacity === undefined || typeof maxLoadCapacity !== 'number') {
    errors.push('maxLoadCapacity must be a number');
  }

  if (acquisitionCost === undefined || typeof acquisitionCost !== 'number') {
    errors.push('acquisitionCost must be a number');
  }

  if (odometer !== undefined && typeof odometer !== 'number') {
    errors.push('odometer must be a number');
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join('. ')));
  }

  next();
};

const validateUpdateVehicle = (req, res, next) => {
  const { registrationNumber, name, model, type, maxLoadCapacity, acquisitionCost, odometer, status } = req.body;
  const errors = [];

  if (registrationNumber !== undefined && typeof registrationNumber !== 'string') errors.push('registrationNumber must be a string');
  if (name !== undefined && typeof name !== 'string') errors.push('name must be a string');
  if (model !== undefined && typeof model !== 'string') errors.push('model must be a string');
  
  if (type !== undefined && !VALID_TYPES.includes(type)) {
    errors.push(`type must be one of: ${VALID_TYPES.join(', ')}`);
  }

  if (maxLoadCapacity !== undefined && typeof maxLoadCapacity !== 'number') {
    errors.push('maxLoadCapacity must be a number');
  }

  if (acquisitionCost !== undefined && typeof acquisitionCost !== 'number') {
    errors.push('acquisitionCost must be a number');
  }

  if (odometer !== undefined && typeof odometer !== 'number') {
    errors.push('odometer must be a number');
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join('. ')));
  }

  next();
};

module.exports = {
  validateCreateVehicle,
  validateUpdateVehicle,
};
