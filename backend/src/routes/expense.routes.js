const express = require('express');
const expenseController = require('../controllers/expense.controller');
const { validateCreateExpense, validateUpdateExpense, validateRejectExpense } = require('../validators/expense.validator');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Operational financial claims
 */

const CREATE_ROLES = ['Fleet Manager', 'Dispatcher', 'Driver'];
const FINANCE_ROLES = ['Fleet Manager', 'Financial Analyst', 'Admin'];
const VIEW_ROLES = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst', 'Admin'];

router.use(authenticate);

/**
 * @swagger
 * /expenses/kpis:
 *   get:
 *     summary: Get expense KPIs
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Expense KPIs retrieved
 */
// KPIs & Analytics
router.get(
  '/kpis',
  authorize(...VIEW_ROLES),
  expenseController.getExpenseKPIs
);

/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Create an expense
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - amount
 *               - date
 *             properties:
 *               type:
 *                 type: string
 *               amount:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date-time
 *               vehicleId:
 *                 type: string
 *                 format: uuid
 *               tripId:
 *                 type: string
 *                 format: uuid
 *               maintenanceId:
 *                 type: string
 *                 format: uuid
 *               description:
 *                 type: string
 *               referenceNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Expense created
 *       400:
 *         description: Validation error
 */
// Create expense
router.post(
  '/',
  authorize(...CREATE_ROLES, 'Admin'),
  validateCreateExpense,
  expenseController.createExpense
);

/**
 * @swagger
 * /expenses:
 *   get:
 *     summary: Get all expenses
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of expenses
 */
// List expenses
router.get(
  '/',
  authorize(...VIEW_ROLES),
  expenseController.getAllExpenses
);

/**
 * @swagger
 * /expenses/{id}:
 *   get:
 *     summary: Get expense by ID
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         description: Expense retrieved
 *       404:
 *         description: Not found
 */
// Get expense by ID
router.get(
  '/:id',
  authorize(...VIEW_ROLES),
  expenseController.getExpenseById
);

/**
 * @swagger
 * /expenses/{id}/timeline:
 *   get:
 *     summary: Get expense timeline
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         description: Timeline retrieved
 */
// Timeline API
router.get(
  '/:id/timeline',
  authorize(...VIEW_ROLES),
  expenseController.getExpenseTimeline
);

/**
 * @swagger
 * /expenses/{id}:
 *   put:
 *     summary: Update an expense
 *     tags: [Expenses]
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
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Expense updated
 */
// Update expense
router.put(
  '/:id',
  authorize(...CREATE_ROLES, 'Admin'),
  validateUpdateExpense,
  expenseController.updateExpense
);

/**
 * @swagger
 * /expenses/{id}/submit:
 *   post:
 *     summary: Submit expense for approval
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         description: Expense submitted
 */
// Lifecycle Transitions
router.post(
  '/:id/submit',
  authorize(...CREATE_ROLES, 'Admin'),
  expenseController.submitExpense
);

/**
 * @swagger
 * /expenses/{id}/approve:
 *   post:
 *     summary: Approve an expense
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         description: Expense approved
 */
router.post(
  '/:id/approve',
  authorize(...FINANCE_ROLES),
  expenseController.approveExpense
);

/**
 * @swagger
 * /expenses/{id}/reject:
 *   post:
 *     summary: Reject an expense
 *     tags: [Expenses]
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
 *               - rejectionReason
 *             properties:
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Expense rejected
 */
router.post(
  '/:id/reject',
  authorize(...FINANCE_ROLES),
  validateRejectExpense,
  expenseController.rejectExpense
);

/**
 * @swagger
 * /expenses/{id}/pending-payment:
 *   post:
 *     summary: Mark expense as pending payment
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         description: Expense pending payment
 */
router.post(
  '/:id/pending-payment',
  authorize(...FINANCE_ROLES),
  expenseController.queuePendingPayment
);

/**
 * @swagger
 * /expenses/{id}/processing-payment:
 *   post:
 *     summary: Mark expense as processing payment
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         description: Expense processing payment
 */
router.post(
  '/:id/processing-payment',
  authorize(...FINANCE_ROLES),
  expenseController.markProcessingPayment
);

/**
 * @swagger
 * /expenses/{id}/pay:
 *   post:
 *     summary: Mark expense as paid
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         description: Expense paid
 */
router.post(
  '/:id/pay',
  authorize(...FINANCE_ROLES),
  expenseController.markPaid
);

/**
 * @swagger
 * /expenses/{id}:
 *   delete:
 *     summary: Soft delete an expense
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         description: Expense deleted
 */
router.delete(
  '/:id',
  authorize(...FINANCE_ROLES),
  expenseController.deleteExpense
);

module.exports = router;
