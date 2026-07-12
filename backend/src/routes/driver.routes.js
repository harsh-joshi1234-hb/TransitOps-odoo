const express = require('express');
const driverController = require('../controllers/driver.controller');
const driverValidator = require('../validators/driver.validator');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = express.Router();

// Apply authentication to all driver routes
router.use(authenticate);

// Readers: Admin, Fleet Manager, Dispatcher, Safety Officer, Financial Analyst
const readers = ['Admin', 'Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'];
// Writers: Admin, Fleet Manager
const writers = ['Admin', 'Fleet Manager'];

router.post(
  '/',
  authorize(...writers),
  driverValidator.validateCreateDriver,
  driverController.createDriver
);

router.get(
  '/',
  authorize(...readers),
  driverController.getAllDrivers
);

router.get(
  '/:id',
  authorize(...readers),
  driverController.getDriverById
);

router.put(
  '/:id',
  authorize(...writers),
  driverValidator.validateUpdateDriver,
  driverController.updateDriver
);

router.patch(
  '/:id/safety-score',
  authorize('Safety Officer'),
  driverController.updateSafetyScore
);

router.delete(
  '/:id',
  authorize(...writers),
  driverController.deleteDriver
);

router.patch(
  '/:id/restore',
  authorize(...writers),
  driverController.restoreDriver
);

module.exports = router;
