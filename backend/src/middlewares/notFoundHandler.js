const ApiError = require('../utils/apiError');

const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Not Found - ${req.originalUrl}`));
};

module.exports = notFoundHandler;
