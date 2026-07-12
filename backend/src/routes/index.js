const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/apiResponse');
const authRoutes = require('./auth.routes');
const vehicleRoutes = require('./vehicle.routes');
const driverRoutes = require('./driver.routes');
const tripRoutes = require('./trip.routes');

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json(new ApiResponse(200, null, 'TransitOps Backend API is running successfully.'));
});

// Import and use other routes here
router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);
router.use('/trips', tripRoutes);

module.exports = router;
