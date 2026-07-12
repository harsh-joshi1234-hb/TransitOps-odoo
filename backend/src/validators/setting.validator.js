exports.validateSettingPayload = (req, res, next) => {
  const { key, value, type, category, description, isEditable } = req.body;
  const errors = [];

  const validTypes = ['STRING', 'NUMBER', 'BOOLEAN', 'JSON'];
  const validCategories = [
    'GENERAL', 'COMPANY', 'TRIP', 'MAINTENANCE', 'FUEL', 
    'EXPENSE', 'NOTIFICATION', 'SECURITY', 'SYSTEM'
  ];

  if (!key || typeof key !== 'string') {
    errors.push('key is required and must be a string');
  } else if (!/^[A-Z0-9_]+$/.test(key)) {
    errors.push('key must be uppercase alphanumeric and underscores only');
  }

  if (value === undefined) {
    errors.push('value is required');
  }

  if (!validTypes.includes(type)) {
    errors.push(`type must be one of: ${validTypes.join(', ')}`);
  }

  if (!validCategories.includes(category)) {
    errors.push(`category must be one of: ${validCategories.join(', ')}`);
  }

  if (isEditable !== undefined && typeof isEditable !== 'boolean') {
    errors.push('isEditable must be a boolean');
  }

  if (type === 'NUMBER' && isNaN(Number(value))) {
    errors.push('value must be a valid number string when type is NUMBER');
  }

  if (type === 'BOOLEAN' && value !== 'true' && value !== 'false') {
    errors.push('value must be "true" or "false" when type is BOOLEAN');
  }

  if (type === 'JSON') {
    try {
      JSON.parse(value);
    } catch (e) {
      errors.push('value must be a valid JSON string when type is JSON');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
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
