const express = require('express');
const reportController = require('../controllers/report.controller');
const reportValidator = require('../validators/report.validator');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Aggregated operational reports
 */

const ALL_ROLES = ['Admin', 'Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'];
const FLEET_ROLES = ['Admin', 'Fleet Manager', 'Dispatcher'];
const TRIP_ROLES = ['Admin', 'Fleet Manager', 'Dispatcher'];
const MAINTENANCE_ROLES = ['Admin', 'Fleet Manager', 'Safety Officer'];
const FUEL_ROLES = ['Admin', 'Fleet Manager', 'Financial Analyst'];
const EXPENSE_ROLES = ['Admin', 'Financial Analyst'];
const DRIVER_ROLES = ['Admin', 'Dispatcher', 'Safety Officer'];
const FINANCE_ROLES = ['Admin', 'Financial Analyst'];

router.use(authenticate);

// Validate filters for all report endpoints
router.use(reportValidator.validateReportFilters);

/**
 * @swagger
 * /reports/fleet:
 *   get:
 *     summary: Get fleet report
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PaginationPage'
 *       - $ref: '#/components/parameters/PaginationLimit'
 *       - $ref: '#/components/parameters/SortBy'
 *       - $ref: '#/components/parameters/SortOrder'
 *       - $ref: '#/components/parameters/StartDate'
 *       - $ref: '#/components/parameters/EndDate'
 *     responses:
 *       200:
 *         description: Fleet report retrieved
 */
router.get(
  '/fleet',
  authorize(...FLEET_ROLES),
  reportController.getFleetReport
);

/**
 * @swagger
 * /reports/trips:
 *   get:
 *     summary: Get trips report
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PaginationPage'
 *       - $ref: '#/components/parameters/PaginationLimit'
 *       - $ref: '#/components/parameters/SortBy'
 *       - $ref: '#/components/parameters/SortOrder'
 *       - $ref: '#/components/parameters/StartDate'
 *       - $ref: '#/components/parameters/EndDate'
 *     responses:
 *       200:
 *         description: Trips report retrieved
 */
router.get(
  '/trips',
  authorize(...TRIP_ROLES),
  reportController.getTripReport
);

/**
 * @swagger
 * /reports/maintenance:
 *   get:
 *     summary: Get maintenance report
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PaginationPage'
 *       - $ref: '#/components/parameters/PaginationLimit'
 *       - $ref: '#/components/parameters/SortBy'
 *       - $ref: '#/components/parameters/SortOrder'
 *       - $ref: '#/components/parameters/StartDate'
 *       - $ref: '#/components/parameters/EndDate'
 *     responses:
 *       200:
 *         description: Maintenance report retrieved
 */
router.get(
  '/maintenance',
  authorize(...MAINTENANCE_ROLES),
  reportController.getMaintenanceReport
);

/**
 * @swagger
 * /reports/fuel:
 *   get:
 *     summary: Get fuel report
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PaginationPage'
 *       - $ref: '#/components/parameters/PaginationLimit'
 *       - $ref: '#/components/parameters/SortBy'
 *       - $ref: '#/components/parameters/SortOrder'
 *       - $ref: '#/components/parameters/StartDate'
 *       - $ref: '#/components/parameters/EndDate'
 *     responses:
 *       200:
 *         description: Fuel report retrieved
 */
router.get(
  '/fuel',
  authorize(...FUEL_ROLES),
  reportController.getFuelReport
);

/**
 * @swagger
 * /reports/expenses:
 *   get:
 *     summary: Get expense report
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PaginationPage'
 *       - $ref: '#/components/parameters/PaginationLimit'
 *       - $ref: '#/components/parameters/SortBy'
 *       - $ref: '#/components/parameters/SortOrder'
 *       - $ref: '#/components/parameters/StartDate'
 *       - $ref: '#/components/parameters/EndDate'
 *     responses:
 *       200:
 *         description: Expense report retrieved
 */
router.get(
  '/expenses',
  authorize(...EXPENSE_ROLES),
  reportController.getExpenseReport
);

/**
 * @swagger
 * /reports/drivers:
 *   get:
 *     summary: Get driver report
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PaginationPage'
 *       - $ref: '#/components/parameters/PaginationLimit'
 *       - $ref: '#/components/parameters/SortBy'
 *       - $ref: '#/components/parameters/SortOrder'
 *       - $ref: '#/components/parameters/StartDate'
 *       - $ref: '#/components/parameters/EndDate'
 *     responses:
 *       200:
 *         description: Driver report retrieved
 */
router.get(
  '/drivers',
  authorize(...DRIVER_ROLES),
  reportController.getDriverReport
);

/**
 * @swagger
 * /reports/financial:
 *   get:
 *     summary: Get financial summary
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/StartDate'
 *       - $ref: '#/components/parameters/EndDate'
 *     responses:
 *       200:
 *         description: Financial summary retrieved
 */
router.get(
  '/financial',
  authorize(...FINANCE_ROLES),
  reportController.getFinancialSummary
);

/**
 * @swagger
 * /reports/executive:
 *   get:
 *     summary: Get executive summary
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/StartDate'
 *       - $ref: '#/components/parameters/EndDate'
 *     responses:
 *       200:
 *         description: Executive summary retrieved
 */
router.get(
  '/executive',
  authorize(...FINANCE_ROLES),
  reportController.getExecutiveSummary
);

module.exports = router;
