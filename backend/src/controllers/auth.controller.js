const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class AuthController {
  register = asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);
    res.status(201).json(new ApiResponse(201, user, 'User registered successfully'));
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    res.status(200).json(new ApiResponse(200, data, 'Login successful'));
  });

  getCurrentUser = asyncHandler(async (req, res) => {
    const user = await authService.getUserById(req.user.userId);
    res.status(200).json(new ApiResponse(200, user, 'Current user retrieved successfully'));
  });

  changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    await authService.changePassword(req.user.userId, oldPassword, newPassword);
    res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
  });

  logout = asyncHandler(async (req, res) => {
    // In a stateless JWT implementation, logout is primarily handled client-side by deleting the token.
    res.status(200).json(new ApiResponse(200, null, 'Logout successful'));
  });
}

module.exports = new AuthController();
