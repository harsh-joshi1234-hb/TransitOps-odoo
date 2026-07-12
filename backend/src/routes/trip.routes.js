const express = require('express');
const tripController = require('../controllers/trip.controller');
const { validateCreateTrip, validateUpdateTrip } = require('../validators/trip.validator');
const { authenticate, authorize } = require('../middlewares/authorize');

const router = express.Router();

const ACTION_ROLES = ['Fleet Manager', 'Dispatcher'];
const VIEW_ROLES = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst', 'Admin'];

router.use(authenticate);

router.post(
  '/',
  authorize(...ACTION_ROLES, 'Admin'),
  validateCreateTrip,
  tripController.createTrip
);

router.get(
  '/',
  authorize(...VIEW_ROLES),
  tripController.getAllTrips
);

router.get(
  '/:id',
  authorize(...VIEW_ROLES),
  tripController.getTripById
);

router.put(
  '/:id',
  authorize(...ACTION_ROLES, 'Admin'),
  validateUpdateTrip,
  tripController.updateTrip
);

router.patch(
  '/:id/dispatch',
  authorize(...ACTION_ROLES, 'Admin'),
  tripController.dispatchTrip
);

router.patch(
  '/:id/start',
  authorize(...ACTION_ROLES, 'Admin'),
  tripController.startTrip
);

router.patch(
  '/:id/complete',
  authorize(...ACTION_ROLES, 'Admin'),
  tripController.completeTrip
);

router.patch(
  '/:id/cancel',
  authorize(...ACTION_ROLES, 'Admin'),
  tripController.cancelTrip
);

module.exports = router;
