const ApiError = require('../utils/apiError');

const validateReportFilters = (req, res, next) => {
  const { startDate, endDate, vehicleId, driverId, tripId, maintenanceId, page, limit } = req.query;
  const errors = [];

  if (startDate && isNaN(new Date(startDate).getTime())) {
    errors.push('startDate must be a valid ISO date string');
  }

  if (endDate && isNaN(new Date(endDate).getTime())) {
    errors.push('endDate must be a valid ISO date string');
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    errors.push('startDate cannot be after endDate');
  }

  // Basic UUID format validation if present
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (vehicleId && !uuidRegex.test(vehicleId)) errors.push('vehicleId must be a valid UUID');
  if (driverId && !uuidRegex.test(driverId)) errors.push('driverId must be a valid UUID');
  if (tripId && !uuidRegex.test(tripId)) errors.push('tripId must be a valid UUID');
  if (maintenanceId && !uuidRegex.test(maintenanceId)) errors.push('maintenanceId must be a valid UUID');

  if (page !== undefined && (isNaN(page) || parseInt(page, 10) < 1)) {
    errors.push('page must be a positive integer');
  }

  if (limit !== undefined && (isNaN(limit) || parseInt(limit, 10) < 1 || parseInt(limit, 10) > 100)) {
    errors.push('limit must be an integer between 1 and 100');
  }

  const validSortOrders = ['asc', 'desc'];
  if (req.query.sortOrder && !validSortOrders.includes(req.query.sortOrder.toLowerCase())) {
    errors.push('sortOrder must be either asc or desc');
  }

  const validSortBys = ['createdAt', 'updatedAt', 'date', 'filledAt', 'serviceDate', 'status', 'amount', 'totalCost', 'actualCost'];
  if (req.query.sortBy && !validSortBys.includes(req.query.sortBy)) {
    errors.push(`sortBy must be one of: ${validSortBys.join(', ')}`);
  }

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join('. ')));
  }

  next();
};

module.exports = {
  validateReportFilters
};
