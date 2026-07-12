const express = require('express');
const fuelController = require('../controllers/fuel.controller');
const { validateCreateFuelLog, validateUpdateFuelLog } = require('../validators/fuel.validator');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Fuel
 *   description: Fuel consumption and costs
 */

const CREATE_ROLES = ['Fleet Manager', 'Dispatcher'];
const APPROVE_ROLES = ['Fleet Manager', 'Financial Analyst'];
const DELETE_ROLES = ['Fleet Manager'];
const VIEW_ROLES = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst', 'Admin'];

router.use(authenticate);

/**
 * @swagger
 * /fuel-logs:
 *   post:
 *     summary: Create fuel log
 *     tags: [Fuel]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicleId
 *               - fuelType
 *               - liters
 *               - pricePerLiter
 *               - filledAt
 *             properties:
 *               vehicleId:
 *                 type: string
 *                 format: uuid
 *               tripId:
 *                 type: string
 *                 format: uuid
 *               driverId:
 *                 type: string
 *                 format: uuid
 *               fuelType:
 *                 type: string
 *               liters:
 *                 type: number
 *               pricePerLiter:
 *                 type: number
 *               totalCost:
 *                 type: number
 *               filledAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Fuel log created
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  authorize(...CREATE_ROLES, 'Admin'),
  validateCreateFuelLog,
  fuelController.createFuelLog
);

/**
 * @swagger
 * /fuel-logs:
 *   get:
 *     summary: Get all fuel logs
 *     tags: [Fuel]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of fuel logs
 */
router.get(
  '/',
  authorize(...VIEW_ROLES),
  fuelController.getAllFuelLogs
);

/**
 * @swagger
 * /fuel-logs/{id}:
 *   get:
 *     summary: Get fuel log by ID
 *     tags: [Fuel]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         description: Fuel log retrieved
 *       404:
 *         description: Not found
 */
router.get(
  '/:id',
  authorize(...VIEW_ROLES),
  fuelController.getFuelLogById
);

/**
 * @swagger
 * /fuel-logs/{id}/timeline:
 *   get:
 *     summary: Get fuel log timeline
 *     tags: [Fuel]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         description: Timeline retrieved
 */
router.get(
  '/:id/timeline',
  authorize(...VIEW_ROLES),
  fuelController.getTimeline
);

/**
 * @swagger
 * /fuel-logs/vehicle/{vehicleId}:
 *   get:
 *     summary: Get fuel logs by vehicle ID
 *     tags: [Fuel]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of fuel logs for vehicle
 */
router.get(
  '/vehicle/:vehicleId',
  authorize(...VIEW_ROLES),
  fuelController.getVehicleFuelLogs
);

/**
 * @swagger
 * /fuel-logs/trip/{tripId}:
 *   get:
 *     summary: Get fuel logs by trip ID
 *     tags: [Fuel]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of fuel logs for trip
 */
router.get(
  '/trip/:tripId',
  authorize(...VIEW_ROLES),
  fuelController.getTripFuelLogs
);

/**
 * @swagger
 * /fuel-logs/{id}:
 *   put:
 *     summary: Update fuel log
 *     tags: [Fuel]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               liters:
 *                 type: number
 *               pricePerLiter:
 *                 type: number
 *     responses:
 *       200:
 *         description: Fuel log updated
 */
router.put(
  '/:id',
  authorize(...CREATE_ROLES, 'Admin'),
  validateUpdateFuelLog,
  fuelController.updateFuelLog
);

/**
 * @swagger
 * /fuel-logs/{id}/submit:
 *   patch:
 *     summary: Submit fuel log
 *     tags: [Fuel]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         description: Fuel log submitted
 */
router.patch(
  '/:id/submit',
  authorize(...CREATE_ROLES, 'Admin'),
  fuelController.submitFuelLog
);

/**
 * @swagger
 * /fuel-logs/{id}/approve:
 *   patch:
 *     summary: Approve fuel log
 *     tags: [Fuel]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         description: Fuel log approved
 */
router.patch(
  '/:id/approve',
  authorize(...APPROVE_ROLES, 'Admin'),
  fuelController.approveFuelLog
);

/**
 * @swagger
 * /fuel-logs/{id}/reject:
 *   patch:
 *     summary: Reject fuel log
 *     tags: [Fuel]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         description: Fuel log rejected
 */
router.patch(
  '/:id/reject',
  authorize(...APPROVE_ROLES, 'Admin'),
  fuelController.rejectFuelLog
);

/**
 * @swagger
 * /fuel-logs/{id}:
 *   delete:
 *     summary: Soft delete fuel log
 *     tags: [Fuel]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         description: Fuel log deleted
 */
router.delete(
  '/:id',
  authorize(...DELETE_ROLES, 'Admin'),
  fuelController.deleteFuelLog
);

module.exports = router;
