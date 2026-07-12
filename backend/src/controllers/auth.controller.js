const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json(new ApiResponse(201, user, 'User registered successfully'));
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const data = await authService.login(email, password);
      res.status(200).json(new ApiResponse(200, data, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const user = await authService.getUserById(req.user.userId);
      res.status(200).json(new ApiResponse(200, user, 'Current user retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      await authService.changePassword(req.user.userId, oldPassword, newPassword);
      res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      // In a stateless JWT implementation, logout is primarily handled client-side by deleting the token.
      // A more robust implementation could involve token blacklisting here.
      res.status(200).json(new ApiResponse(200, null, 'Logout successful'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
