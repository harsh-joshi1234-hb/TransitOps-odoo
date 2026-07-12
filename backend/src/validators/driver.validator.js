const ApiError = require('../utils/apiError');

const VALID_STATUSES = ['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED'];

const validateCreateDriver = (req, res, next) => {
  const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, email, address, safetyScore, status } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string') errors.push('Valid name is required');
  if (!licenseNumber || typeof licenseNumber !== 'string') errors.push('Valid licenseNumber is required');
  if (!licenseCategory || typeof licenseCategory !== 'string') errors.push('Valid licenseCategory is required');
  
  if (!licenseExpiryDate || isNaN(new Date(licenseExpiryDate).getTime())) {
    errors.push('Valid licenseExpiryDate (ISO format) is required');
  }

  if (!contactNumber || typeof contactNumber !== 'string') errors.push('Valid contactNumber is required');
  
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (address !== undefined && typeof address !== 'string') errors.push('address must be a string');

  if (safetyScore !== undefined && typeof safetyScore !== 'number') {
    errors.push('safetyScore must be a number');
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join('. ')));
  }

  next();
};

const validateUpdateDriver = (req, res, next) => {
  const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, email, address, safetyScore, status } = req.body;
  const errors = [];

  if (name !== undefined && typeof name !== 'string') errors.push('name must be a string');
  if (licenseNumber !== undefined && typeof licenseNumber !== 'string') errors.push('licenseNumber must be a string');
  if (licenseCategory !== undefined && typeof licenseCategory !== 'string') errors.push('licenseCategory must be a string');
  
  if (licenseExpiryDate !== undefined && isNaN(new Date(licenseExpiryDate).getTime())) {
    errors.push('licenseExpiryDate must be a valid ISO date');
  }

  if (contactNumber !== undefined && typeof contactNumber !== 'string') errors.push('contactNumber must be a string');
  
  if (email !== undefined && (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    errors.push('email must be a valid email format');
  }

  if (address !== undefined && typeof address !== 'string') errors.push('address must be a string');

  if (safetyScore !== undefined && typeof safetyScore !== 'number') {
    errors.push('safetyScore must be a number');
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
  validateCreateDriver,
  validateUpdateDriver,
};
