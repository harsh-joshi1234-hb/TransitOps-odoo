const express = require('express');
const maintenanceController = require('../controllers/maintenance.controller');
const { validateCreateMaintenance, validateUpdateMaintenance } = require('../validators/maintenance.validator');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Maintenance
 *   description: Vehicle repair and service logs
 */

const REQUEST_ROLES = ['Fleet Manager', 'Dispatcher', 'Safety Officer'];
const MANAGEMENT_ROLES = ['Fleet Manager'];
const VIEW_ROLES = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst', 'Admin'];

router.use(authenticate);

/**
 * @swagger
 * /maintenance:
 *   post:
 *     summary: Request maintenance
 *     tags: [Maintenance]
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
 *               - maintenanceType
 *               - description
 *             properties:
 *               vehicleId:
 *                 type: string
 *                 format: uuid
 *               maintenanceType:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Maintenance requested successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
router.post(
  '/',
  authorize(...REQUEST_ROLES, 'Admin'),
  validateCreateMaintenance,
  maintenanceController.createMaintenance
);

/**
 * @swagger
 * /maintenance:
 *   get:
 *     summary: Get all maintenance logs
 *     tags: [Maintenance]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of maintenance logs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get(
  '/',
  authorize(...VIEW_ROLES),
  maintenanceController.getAllMaintenance
);

/**
 * @swagger
 * /maintenance/{id}:
 *   get:
 *     summary: Get maintenance log by ID
 *     tags: [Maintenance]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         description: Maintenance log retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Maintenance log not found
 */
router.get(
  '/:id',
  authorize(...VIEW_ROLES),
  maintenanceController.getMaintenanceById
);

/**
 * @swagger
 * /maintenance/{id}/timeline:
 *   get:
 *     summary: Get maintenance timeline
 *     tags: [Maintenance]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         description: Timeline retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Maintenance log not found
 */
router.get(
  '/:id/timeline',
  authorize(...VIEW_ROLES),
  maintenanceController.getTimeline
);

/**
 * @swagger
 * /maintenance/{id}:
 *   put:
 *     summary: Update maintenance log
 *     tags: [Maintenance]
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
 *               description:
 *                 type: string
 *               estimatedCost:
 *                 type: number
 *     responses:
 *       200:
 *         description: Maintenance updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Maintenance log not found
 */
router.put(
  '/:id',
  authorize(...MANAGEMENT_ROLES, 'Admin'),
  validateUpdateMaintenance,
  maintenanceController.updateMaintenance
);

/**
 * @swagger
 * /maintenance/{id}/schedule:
 *   patch:
 *     summary: Schedule maintenance
 *     tags: [Maintenance]
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
 *             required:
 *               - serviceDate
 *             properties:
 *               serviceDate:
 *                 type: string
 *                 format: date-time
 *               vendorName:
 *                 type: string
 *               estimatedCost:
 *                 type: number
 *     responses:
 *       200:
 *         description: Maintenance scheduled
 *       404:
 *         description: Maintenance log not found
 */
router.patch(
  '/:id/schedule',
  authorize(...MANAGEMENT_ROLES, 'Admin'),
  maintenanceController.scheduleMaintenance
);

/**
 * @swagger
 * /maintenance/{id}/start:
 *   patch:
 *     summary: Start maintenance
 *     tags: [Maintenance]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         description: Maintenance started
 *       404:
 *         description: Maintenance log not found
 */
router.patch(
  '/:id/start',
  authorize(...MANAGEMENT_ROLES, 'Admin'),
  maintenanceController.startMaintenance
);

/**
 * @swagger
 * /maintenance/{id}/complete:
 *   patch:
 *     summary: Complete maintenance
 *     tags: [Maintenance]
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
 *             required:
 *               - actualCost
 *             properties:
 *               actualCost:
 *                 type: number
 *               resolutionNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Maintenance completed
 *       404:
 *         description: Maintenance log not found
 */
router.patch(
  '/:id/complete',
  authorize(...MANAGEMENT_ROLES, 'Admin'),
  maintenanceController.completeMaintenance
);

/**
 * @swagger
 * /maintenance/{id}/cancel:
 *   patch:
 *     summary: Cancel maintenance
 *     tags: [Maintenance]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         description: Maintenance cancelled
 *       404:
 *         description: Maintenance log not found
 */
router.patch(
  '/:id/cancel',
  authorize(...MANAGEMENT_ROLES, 'Admin'),
  maintenanceController.cancelMaintenance
);

module.exports = router;
