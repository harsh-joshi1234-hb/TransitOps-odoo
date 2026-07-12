const ApiError = require('../utils/apiError');

const VALID_FUEL_TYPES = ['DIESEL', 'PETROL', 'CNG', 'LNG', 'ELECTRIC', 'OTHER'];
const VALID_PAYMENT_METHODS = ['CASH', 'CORPORATE_CARD', 'FUEL_CARD', 'BANK_TRANSFER', 'CREDIT', 'OTHER'];

const validateCreateFuelLog = (req, res, next) => {
  const { fuelType, paymentMethod, liters, pricePerLiter, odometer, filledAt, vehicleId } = req.body;
  const errors = [];

  if (!fuelType || !VALID_FUEL_TYPES.includes(fuelType)) {
    errors.push(`fuelType must be one of: ${VALID_FUEL_TYPES.join(', ')}`);
  }

  if (paymentMethod !== undefined && !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    errors.push(`paymentMethod must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`);
  }

  if (liters === undefined || typeof liters !== 'number' || liters <= 0) {
    errors.push('liters must be a positive number');
  }

  if (pricePerLiter === undefined || typeof pricePerLiter !== 'number' || pricePerLiter <= 0) {
    errors.push('pricePerLiter must be a positive number');
  }

  if (odometer === undefined || typeof odometer !== 'number' || odometer < 0) {
    errors.push('odometer must be a valid non-negative number');
  }

  if (!filledAt || isNaN(new Date(filledAt).getTime())) {
    errors.push('filledAt must be a valid ISO date');
  }

  if (!vehicleId || typeof vehicleId !== 'string') {
    errors.push('Valid vehicleId is required');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join('. ')));
  }

  next();
};

const validateUpdateFuelLog = (req, res, next) => {
  const { fuelType, paymentMethod, liters, pricePerLiter, odometer, filledAt, vehicleId } = req.body;
  const errors = [];

  if (fuelType !== undefined && !VALID_FUEL_TYPES.includes(fuelType)) {
    errors.push(`fuelType must be one of: ${VALID_FUEL_TYPES.join(', ')}`);
  }

  if (paymentMethod !== undefined && !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    errors.push(`paymentMethod must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`);
  }

  if (liters !== undefined && (typeof liters !== 'number' || liters <= 0)) {
    errors.push('liters must be a positive number');
  }

  if (pricePerLiter !== undefined && (typeof pricePerLiter !== 'number' || pricePerLiter <= 0)) {
    errors.push('pricePerLiter must be a positive number');
  }

  if (odometer !== undefined && (typeof odometer !== 'number' || odometer < 0)) {
    errors.push('odometer must be a valid non-negative number');
  }

  if (filledAt !== undefined && isNaN(new Date(filledAt).getTime())) {
    errors.push('filledAt must be a valid ISO date');
  }

  if (vehicleId !== undefined && typeof vehicleId !== 'string') {
    errors.push('vehicleId must be a string');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join('. ')));
  }

  next();
};

module.exports = {
  validateCreateFuelLog,
  validateUpdateFuelLog,
};
