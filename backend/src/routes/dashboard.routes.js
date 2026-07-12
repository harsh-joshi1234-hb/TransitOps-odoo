const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: High-level KPIs and chart data
 */

const ALL_ROLES = ['Admin', 'Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'];
const FLEET_ROLES = ['Admin', 'Fleet Manager', 'Dispatcher', 'Safety Officer'];
const TRIP_ROLES = ['Admin', 'Fleet Manager', 'Dispatcher', 'Safety Officer'];
const MAINTENANCE_ROLES = ['Admin', 'Fleet Manager', 'Safety Officer'];
const FUEL_ROLES = ['Admin', 'Fleet Manager', 'Financial Analyst'];
const FINANCE_ROLES = ['Admin', 'Financial Analyst'];
const CHART_ROLES = ['Admin', 'Fleet Manager', 'Financial Analyst'];

router.use(authenticate);

/**
 * @swagger
 * /dashboard/overview:
 *   get:
 *     summary: Get dashboard overview KPIs
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Overview KPIs retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get(
  '/overview',
  authorize(...ALL_ROLES),
  dashboardController.getOverview
);

/**
 * @swagger
 * /dashboard/charts:
 *   get:
 *     summary: Get dashboard charts data
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Charts data retrieved
 */
router.get(
  '/charts',
  authorize(...CHART_ROLES),
  dashboardController.getCharts
);

/**
 * @swagger
 * /dashboard/fleet:
 *   get:
 *     summary: Get fleet KPIs
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Fleet KPIs retrieved
 */
router.get(
  '/fleet',
  authorize(...FLEET_ROLES),
  dashboardController.getFleet
);

/**
 * @swagger
 * /dashboard/trips:
 *   get:
 *     summary: Get trips KPIs
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Trips KPIs retrieved
 */
router.get(
  '/trips',
  authorize(...TRIP_ROLES),
  dashboardController.getTrips
);

/**
 * @swagger
 * /dashboard/maintenance:
 *   get:
 *     summary: Get maintenance KPIs
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Maintenance KPIs retrieved
 */
router.get(
  '/maintenance',
  authorize(...MAINTENANCE_ROLES),
  dashboardController.getMaintenance
);

/**
 * @swagger
 * /dashboard/fuel:
 *   get:
 *     summary: Get fuel KPIs
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Fuel KPIs retrieved
 */
router.get(
  '/fuel',
  authorize(...FUEL_ROLES),
  dashboardController.getFuel
);

/**
 * @swagger
 * /dashboard/expenses:
 *   get:
 *     summary: Get expenses KPIs
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Expenses KPIs retrieved
 */
router.get(
  '/expenses',
  authorize(...FINANCE_ROLES),
  dashboardController.getExpenses
);

/**
 * @swagger
 * /dashboard/analytics:
 *   get:
 *     summary: Get advanced analytics
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved
 */
router.get(
  '/analytics',
  authorize(...FINANCE_ROLES),
  dashboardController.getAnalytics
);

module.exports = router;
