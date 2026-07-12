const ApiError = require('../utils/apiError');

const validateRegister = (req, res, next) => {
  const { email, password, firstName, lastName, roleName } = req.body;
  if (!email || !password || !firstName || !lastName || !roleName) {
    return next(new ApiError(400, 'Missing required fields: email, password, firstName, lastName, roleName'));
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new ApiError(400, 'Invalid email format'));
  }

  if (password.length < 8) {
    return next(new ApiError(400, 'Password must be at least 8 characters long'));
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ApiError(400, 'Missing required fields: email, password'));
  }
  next();
};

const validateChangePassword = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return next(new ApiError(400, 'Missing required fields: oldPassword, newPassword'));
  }
  if (newPassword.length < 8) {
    return next(new ApiError(400, 'New password must be at least 8 characters long'));
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateChangePassword,
};
