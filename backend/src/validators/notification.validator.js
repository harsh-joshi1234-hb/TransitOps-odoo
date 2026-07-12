const { uuidRegex } = require('./auth.validator'); // Re-using regex or defining it here

const uuidRegexLocal = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

exports.validateNotificationId = (req, res, next) => {
  const { id } = req.params;
  if (!uuidRegexLocal.test(id)) {
    return res.status(400).json({ success: false, message: 'Invalid notification ID' });
  }
  next();
};

exports.validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  const errors = [];

  if (page !== undefined && (isNaN(page) || parseInt(page, 10) < 1)) {
    errors.push('page must be a positive integer');
  }

  if (limit !== undefined && (isNaN(limit) || parseInt(limit, 10) < 1 || parseInt(limit, 10) > 100)) {
    errors.push('limit must be an integer between 1 and 100');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

exports.validateBroadcast = (req, res, next) => {
  const { title, message, priority, targetRole } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.push('Title is required');
  }

  if (!message || typeof message !== 'string' || message.trim() === '') {
    errors.push('Message is required');
  }

  const validPriorities = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'];
  if (priority && !validPriorities.includes(priority)) {
    errors.push(`Priority must be one of: ${validPriorities.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};
