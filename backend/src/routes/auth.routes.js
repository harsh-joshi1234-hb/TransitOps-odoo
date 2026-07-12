const express = require('express');
const authController = require('../controllers/auth.controller');
const authValidator = require('../validators/auth.validator');
const authenticate = require('../middlewares/authenticate');
const router = express.Router();

// Public routes
router.post('/register', authValidator.validateRegister, authController.register);
router.post('/login', authValidator.validateLogin, authController.login);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.put('/change-password', authenticate, authValidator.validateChangePassword, authController.changePassword);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
