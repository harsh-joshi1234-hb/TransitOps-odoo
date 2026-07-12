const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/apiResponse');
const authRoutes = require('./auth.routes');

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json(new ApiResponse(200, null, 'TransitOps Backend API is running successfully.'));
});

// Import and use other routes here
router.use('/auth', authRoutes);
// router.use('/vehicles', vehicleRoutes);

module.exports = router;
