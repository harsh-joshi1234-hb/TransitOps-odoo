const express = require('express');
const expenseController = require('../controllers/expense.controller');
const { validateCreateExpense, validateUpdateExpense, validateRejectExpense } = require('../validators/expense.validator');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = express.Router();

const CREATE_ROLES = ['Fleet Manager', 'Dispatcher', 'Driver'];
const FINANCE_ROLES = ['Fleet Manager', 'Financial Analyst', 'Admin'];
const VIEW_ROLES = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst', 'Admin'];

router.use(authenticate);

// KPIs & Analytics
router.get(
  '/kpis',
  authorize(...VIEW_ROLES),
  expenseController.getExpenseKPIs
);

// Create expense
router.post(
  '/',
  authorize(...CREATE_ROLES, 'Admin'),
  validateCreateExpense,
  expenseController.createExpense
);

// List expenses
router.get(
  '/',
  authorize(...VIEW_ROLES),
  expenseController.getAllExpenses
);

// Get expense by ID
router.get(
  '/:id',
  authorize(...VIEW_ROLES),
  expenseController.getExpenseById
);

// Timeline API
router.get(
  '/:id/timeline',
  authorize(...VIEW_ROLES),
  expenseController.getExpenseTimeline
);

// Update expense
router.put(
  '/:id',
  authorize(...CREATE_ROLES, 'Admin'),
  validateUpdateExpense,
  expenseController.updateExpense
);

// Lifecycle Transitions
router.post(
  '/:id/submit',
  authorize(...CREATE_ROLES, 'Admin'),
  expenseController.submitExpense
);

router.post(
  '/:id/approve',
  authorize(...FINANCE_ROLES),
  expenseController.approveExpense
);

router.post(
  '/:id/reject',
  authorize(...FINANCE_ROLES),
  validateRejectExpense,
  expenseController.rejectExpense
);

router.post(
  '/:id/pending-payment',
  authorize(...FINANCE_ROLES),
  expenseController.queuePendingPayment
);

router.post(
  '/:id/processing-payment',
  authorize(...FINANCE_ROLES),
  expenseController.markProcessingPayment
);

router.post(
  '/:id/pay',
  authorize(...FINANCE_ROLES),
  expenseController.markPaid
);

router.delete(
  '/:id',
  authorize(...FINANCE_ROLES),
  expenseController.deleteExpense
);

module.exports = router;
