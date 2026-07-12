const express = require('express');
const vehicleController = require('../controllers/vehicle.controller');
const vehicleValidator = require('../validators/vehicle.validator');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = express.Router();

// Apply authentication to all vehicle routes
router.use(authenticate);

// Readers: Admin, Fleet Manager, Dispatcher, Safety Officer, Financial Analyst
const readers = ['Admin', 'Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'];
// Writers: Admin, Fleet Manager
const writers = ['Admin', 'Fleet Manager'];

router.post(
  '/',
  authorize(...writers),
  vehicleValidator.validateCreateVehicle,
  vehicleController.createVehicle
);

router.get(
  '/',
  authorize(...readers),
  vehicleController.getAllVehicles
);

router.get(
  '/:id',
  authorize(...readers),
  vehicleController.getVehicleById
);

router.put(
  '/:id',
  authorize(...writers),
  vehicleValidator.validateUpdateVehicle,
  vehicleController.updateVehicle
);

router.delete(
  '/:id',
  authorize(...writers),
  vehicleController.deleteVehicle
);

router.patch(
  '/:id/restore',
  authorize(...writers),
  vehicleController.restoreVehicle
);

module.exports = router;
