const express = require('express');
const maintenanceController = require('../controllers/maintenance.controller');
const { validateCreateMaintenance, validateUpdateMaintenance } = require('../validators/maintenance.validator');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = express.Router();

const REQUEST_ROLES = ['Fleet Manager', 'Dispatcher', 'Safety Officer'];
const MANAGEMENT_ROLES = ['Fleet Manager'];
const VIEW_ROLES = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst', 'Admin'];

router.use(authenticate);

router.post(
  '/',
  authorize(...REQUEST_ROLES, 'Admin'),
  validateCreateMaintenance,
  maintenanceController.createMaintenance
);

router.get(
  '/',
  authorize(...VIEW_ROLES),
  maintenanceController.getAllMaintenance
);

router.get(
  '/:id',
  authorize(...VIEW_ROLES),
  maintenanceController.getMaintenanceById
);

router.get(
  '/:id/timeline',
  authorize(...VIEW_ROLES),
  maintenanceController.getTimeline
);

router.put(
  '/:id',
  authorize(...MANAGEMENT_ROLES, 'Admin'),
  validateUpdateMaintenance,
  maintenanceController.updateMaintenance
);

router.patch(
  '/:id/schedule',
  authorize(...MANAGEMENT_ROLES, 'Admin'),
  maintenanceController.scheduleMaintenance
);

router.patch(
  '/:id/start',
  authorize(...MANAGEMENT_ROLES, 'Admin'),
  maintenanceController.startMaintenance
);

router.patch(
  '/:id/complete',
  authorize(...MANAGEMENT_ROLES, 'Admin'),
  maintenanceController.completeMaintenance
);

router.patch(
  '/:id/cancel',
  authorize(...MANAGEMENT_ROLES, 'Admin'),
  maintenanceController.cancelMaintenance
);

module.exports = router;
