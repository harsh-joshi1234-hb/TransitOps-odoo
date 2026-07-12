const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const userRepository = require('../repositories/user.repository');
const ApiError = require('../utils/apiError');

class AuthService {
  constructor() {
    this.saltRounds = 10;
  }

  async register(data) {
    const { password, firstName, lastName } = data;
    const email = data.email.trim().toLowerCase();
    const roleName = 'Dispatcher';

    // Check if user already exists
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
      throw new ApiError(409, 'Email already in use');
    }

    // Check if role exists
    const role = await userRepository.findRoleByName(roleName);
    if (!role) {
      throw new ApiError(500, `Default role '${roleName}' does not exist in the system`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    // Create user
    const newUser = await userRepository.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      roleId: role.id,
      isActive: true, // Default to active for this implementation
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async login(rawEmail, password) {
    const email = rawEmail.trim().toLowerCase();
    // Find user
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      // Use generic error for security (prevents user enumeration)
      throw new ApiError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'User account is inactive. Please contact administrator.');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate JWT payload containing non-sensitive info
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role.name,
    };

    // Sign token with expiration
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return { token, user: userWithoutPassword };
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Incorrect old password');
    }

    // Hash new password and update
    const newHashedPassword = await bcrypt.hash(newPassword, this.saltRounds);
    await userRepository.updatePassword(userId, newHashedPassword);
    
    return true;
  }

  async getUserById(userId) {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = new AuthService();
