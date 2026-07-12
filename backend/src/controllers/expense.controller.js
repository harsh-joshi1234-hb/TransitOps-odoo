const expenseService = require('../services/expense.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class ExpenseController {
  createExpense = asyncHandler(async (req, res) => {
    const userId = req.user ? req.user.id : 'SYSTEM';
    const expense = await expenseService.createExpense(req.body, userId);
    res.status(201).json(new ApiResponse(201, expense, 'Expense drafted successfully'));
  });

  getAllExpenses = asyncHandler(async (req, res) => {
    const data = await expenseService.getAllExpenses(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Expenses retrieved successfully'));
  });

  getExpenseKPIs = asyncHandler(async (req, res) => {
    const kpis = await expenseService.getExpenseKPIs();
    res.status(200).json(new ApiResponse(200, kpis, 'Expense KPIs retrieved successfully'));
  });

  getExpenseById = asyncHandler(async (req, res) => {
    const expense = await expenseService.getExpenseById(req.params.id);
    res.status(200).json(new ApiResponse(200, expense, 'Expense retrieved successfully'));
  });

  getExpenseTimeline = asyncHandler(async (req, res) => {
    const timeline = await expenseService.getExpenseTimeline(req.params.id);
    res.status(200).json(new ApiResponse(200, timeline, 'Expense timeline retrieved successfully'));
  });

  updateExpense = asyncHandler(async (req, res) => {
    const expense = await expenseService.updateExpense(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, expense, 'Expense updated successfully'));
  });

  submitExpense = asyncHandler(async (req, res) => {
    const expense = await expenseService.submitExpense(req.params.id);
    res.status(200).json(new ApiResponse(200, expense, 'Expense submitted successfully'));
  });

  approveExpense = asyncHandler(async (req, res) => {
    const userId = req.user ? req.user.id : 'SYSTEM';
    const expense = await expenseService.approveExpense(req.params.id, userId);
    res.status(200).json(new ApiResponse(200, expense, 'Expense approved successfully'));
  });

  rejectExpense = asyncHandler(async (req, res) => {
    const { rejectionReason } = req.body;
    const expense = await expenseService.rejectExpense(req.params.id, rejectionReason);
    res.status(200).json(new ApiResponse(200, expense, 'Expense rejected successfully'));
  });

  queuePendingPayment = asyncHandler(async (req, res) => {
    const userId = req.user ? req.user.id : 'SYSTEM';
    const expense = await expenseService.transitionPaymentState(req.params.id, 'PENDING_PAYMENT', userId);
    res.status(200).json(new ApiResponse(200, expense, 'Expense queued for pending payment successfully'));
  });

  markProcessingPayment = asyncHandler(async (req, res) => {
    const userId = req.user ? req.user.id : 'SYSTEM';
    const expense = await expenseService.transitionPaymentState(req.params.id, 'PROCESSING_PAYMENT', userId);
    res.status(200).json(new ApiResponse(200, expense, 'Expense marked as processing payment successfully'));
  });

  markPaid = asyncHandler(async (req, res) => {
    const userId = req.user ? req.user.id : 'SYSTEM';
    const { paymentReference } = req.body;
    const expense = await expenseService.transitionPaymentState(req.params.id, 'PAID', userId, paymentReference);
    res.status(200).json(new ApiResponse(200, expense, 'Expense marked as paid successfully'));
  });

  deleteExpense = asyncHandler(async (req, res) => {
    const expense = await expenseService.softDeleteExpense(req.params.id);
    res.status(200).json(new ApiResponse(200, expense, 'Expense deleted successfully'));
  });
}

module.exports = new ExpenseController();
