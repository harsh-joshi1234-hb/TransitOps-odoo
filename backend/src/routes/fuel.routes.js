const express = require('express');
const fuelController = require('../controllers/fuel.controller');
const { validateCreateFuelLog, validateUpdateFuelLog } = require('../validators/fuel.validator');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = express.Router();

const CREATE_ROLES = ['Fleet Manager', 'Dispatcher'];
const APPROVE_ROLES = ['Fleet Manager', 'Financial Analyst'];
const DELETE_ROLES = ['Fleet Manager'];
const VIEW_ROLES = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst', 'Admin'];

router.use(authenticate);

router.post(
  '/',
  authorize(...CREATE_ROLES, 'Admin'),
  validateCreateFuelLog,
  fuelController.createFuelLog
);

router.get(
  '/',
  authorize(...VIEW_ROLES),
  fuelController.getAllFuelLogs
);

router.get(
  '/:id',
  authorize(...VIEW_ROLES),
  fuelController.getFuelLogById
);

router.get(
  '/:id/timeline',
  authorize(...VIEW_ROLES),
  fuelController.getTimeline
);

router.get(
  '/vehicle/:vehicleId',
  authorize(...VIEW_ROLES),
  fuelController.getVehicleFuelLogs
);

router.get(
  '/trip/:tripId',
  authorize(...VIEW_ROLES),
  fuelController.getTripFuelLogs
);

router.put(
  '/:id',
  authorize(...CREATE_ROLES, 'Admin'),
  validateUpdateFuelLog,
  fuelController.updateFuelLog
);

router.patch(
  '/:id/submit',
  authorize(...CREATE_ROLES, 'Admin'),
  fuelController.submitFuelLog
);

router.patch(
  '/:id/approve',
  authorize(...APPROVE_ROLES, 'Admin'),
  fuelController.approveFuelLog
);

router.patch(
  '/:id/reject',
  authorize(...APPROVE_ROLES, 'Admin'),
  fuelController.rejectFuelLog
);

router.delete(
  '/:id',
  authorize(...DELETE_ROLES, 'Admin'),
  fuelController.deleteFuelLog
);

module.exports = router;
