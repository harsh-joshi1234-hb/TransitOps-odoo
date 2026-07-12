const config = require('../config/env');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (config.nodeEnv === 'development') {
    logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, err);
  } else {
    logger.error(`${statusCode} - ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
