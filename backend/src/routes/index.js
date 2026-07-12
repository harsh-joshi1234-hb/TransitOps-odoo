const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/apiResponse');
const authRoutes = require('./auth.routes');
const vehicleRoutes = require('./vehicle.routes');
const driverRoutes = require('./driver.routes');
const tripRoutes = require('./trip.routes');
const maintenanceRoutes = require('./maintenance.routes');
const fuelRoutes = require('./fuel.routes');
const expenseRoutes = require('./expense.routes');
const dashboardRoutes = require('./dashboard.routes');
const reportRoutes = require('./report.routes');
const notificationRoutes = require('./notification.routes');
const settingRoutes = require('./setting.routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../config/swagger');

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json(new ApiResponse(200, null, 'TransitOps Backend API is running successfully.'));
});

// Swagger UI
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Import and use other routes here
router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);
router.use('/trips', tripRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/fuel-logs', fuelRoutes);
router.use('/expenses', expenseRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/settings', settingRoutes);

module.exports = router;

