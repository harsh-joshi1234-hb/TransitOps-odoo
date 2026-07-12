const ApiError = require('../utils/apiError');

const VALID_EXPENSE_TYPES = ['TOLL', 'PARKING', 'FINE', 'MAINTENANCE', 'FUEL', 'OTHER'];
const VALID_EXPENSE_STATUSES = ['DRAFT', 'SUBMITTED', 'APPROVED', 'PENDING_PAYMENT', 'PROCESSING_PAYMENT', 'PAID', 'REJECTED'];

const validateCreateExpense = (req, res, next) => {
  const { type, amount, date, vendor, receiptNumber, vehicleId, tripId } = req.body;
  const errors = [];

  if (!type || !VALID_EXPENSE_TYPES.includes(type)) {
    errors.push(`type must be one of: ${VALID_EXPENSE_TYPES.join(', ')}`);
  }

  if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
    errors.push('amount must be a positive number');
  }

  if (date && isNaN(new Date(date).getTime())) {
    errors.push('date must be a valid ISO date string');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join('. ')));
  }

  next();
};

const validateUpdateExpense = (req, res, next) => {
  const { type, amount, date } = req.body;
  const errors = [];

  if (type !== undefined && !VALID_EXPENSE_TYPES.includes(type)) {
    errors.push(`type must be one of: ${VALID_EXPENSE_TYPES.join(', ')}`);
  }

  if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
    errors.push('amount must be a positive number');
  }

  if (date !== undefined && isNaN(new Date(date).getTime())) {
    errors.push('date must be a valid ISO date string');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join('. ')));
  }

  next();
};

const validateRejectExpense = (req, res, next) => {
  const { rejectionReason } = req.body;
  if (!rejectionReason || typeof rejectionReason !== 'string' || !rejectionReason.trim()) {
    return next(new ApiError(400, 'rejectionReason is required when rejecting an expense'));
  }
  next();
};

module.exports = {
  VALID_EXPENSE_TYPES,
  VALID_EXPENSE_STATUSES,
  validateCreateExpense,
  validateUpdateExpense,
  validateRejectExpense,
};
