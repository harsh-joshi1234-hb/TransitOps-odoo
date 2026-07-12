const ApiError = require('../utils/apiError');

const validateRegister = (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName || !lastName) {
    return next(new ApiError(400, 'Missing required fields: email, password, firstName, lastName'));
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new ApiError(400, 'Invalid email format'));
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return next(new ApiError(400, 'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character'));
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
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return next(new ApiError(400, 'New password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character'));
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateChangePassword,
};
