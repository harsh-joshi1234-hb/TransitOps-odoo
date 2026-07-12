const expenseRepository = require('../repositories/expense.repository');
const vehicleRepository = require('../repositories/vehicle.repository');
const prisma = require('../config/prisma');
const ApiError = require('../utils/apiError');

class ExpenseService {
  async _generateExpenseNumber() {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `EXP-${todayStr}-`;

    const latestExpense = await expenseRepository.getLatestExpenseForDate(prefix);

    let nextSequence = 1;
    if (latestExpense && latestExpense.expenseNumber) {
      const lastSequence = parseInt(latestExpense.expenseNumber.split('-')[2], 10);
      if (!isNaN(lastSequence)) {
        nextSequence = lastSequence + 1;
      }
    }

    return `${prefix}${String(nextSequence).padStart(4, '0')}`;
  }

  async _validateResources(vehicleId, tripId) {
    if (vehicleId) {
      const vehicle = await vehicleRepository.findVehicleById(vehicleId);
      if (!vehicle) throw new ApiError(404, 'Vehicle not found');
      if (vehicle.isDeleted) throw new ApiError(400, 'Cannot associate expense with a deleted vehicle');
    }

    if (tripId) {
      const trip = await prisma.trip.findUnique({ where: { id: tripId } });
      if (!trip) throw new ApiError(404, 'Trip not found');
      if (trip.status === 'CANCELLED') throw new ApiError(400, 'Cannot associate expense with a CANCELLED trip');
      if (vehicleId && trip.vehicleId !== vehicleId) {
        throw new ApiError(400, 'Trip vehicle mismatch with provided vehicleId');
      }
    }
  }

  async createExpense(data, userId) {
    await this._validateResources(data.vehicleId, data.tripId);

    // Enterprise Duplicate Check: vendor + expenseDate + amount + receiptNumber
    const duplicate = await expenseRepository.findDuplicateExpense({
      vendor: data.vendor,
      date: data.date || new Date(),
      amount: data.amount,
      receiptNumber: data.receiptNumber,
    });

    if (duplicate) {
      throw new ApiError(
        409,
        `Duplicate expense detected: An expense (${duplicate.expenseNumber}) with amount $${data.amount} on this date for vendor "${data.vendor || 'N/A'}" already exists.`
      );
    }

    data.expenseNumber = await this._generateExpenseNumber();
    data.createdByUserId = userId;
    data.status = 'DRAFT';

    return expenseRepository.createExpense(data);
  }

  async getExpenseById(id) {
    const expense = await expenseRepository.findExpenseById(id);
    if (!expense) {
      throw new ApiError(404, 'Expense not found');
    }
    return expense;
  }

  async getAllExpenses(query) {
    const { status, type, vehicleId, tripId, search, startDate, endDate, sortBy, sortOrder, page = 1, limit = 10 } = query;
    const filters = { status, type, vehicleId, tripId, search, startDate, endDate };
    const sort = { sortBy, sortOrder };

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    if (parsedPage < 1 || parsedLimit < 1) throw new ApiError(400, 'Page and limit must be positive integers');

    const pagination = { skip: (parsedPage - 1) * parsedLimit, take: parsedLimit };

    const { expenses, total } = await expenseRepository.findAllExpenses({ filters, sort, pagination });
    return {
      expenses,
      meta: { total, page: parsedPage, limit: parsedLimit, totalPages: Math.ceil(total / parsedLimit) },
    };
  }

  async updateExpense(id, data) {
    const expense = await this.getExpenseById(id);

    if (!['DRAFT', 'REJECTED'].includes(expense.status)) {
      throw new ApiError(400, `Cannot update expense that is currently ${expense.status}. Only DRAFT or REJECTED claims can be modified.`);
    }

    await this._validateResources(data.vehicleId || expense.vehicleId, data.tripId || expense.tripId);

    return expenseRepository.updateExpense(id, data);
  }

  async submitExpense(id) {
    const expense = await this.getExpenseById(id);
    if (!['DRAFT', 'REJECTED'].includes(expense.status)) {
      throw new ApiError(400, `Expense cannot be submitted from status: ${expense.status}`);
    }

    return expenseRepository.submitExpense(id);
  }

  async approveExpense(id, userId) {
    const expense = await this.getExpenseById(id);
    if (expense.status !== 'SUBMITTED') {
      throw new ApiError(400, `Expense must be SUBMITTED to be approved. Current status: ${expense.status}`);
    }

    return expenseRepository.approveExpense(id, userId);
  }

  async rejectExpense(id, rejectionReason) {
    const expense = await this.getExpenseById(id);
    if (expense.status !== 'SUBMITTED') {
      throw new ApiError(400, `Expense must be SUBMITTED to be rejected. Current status: ${expense.status}`);
    }

    return expenseRepository.rejectExpense(id, rejectionReason);
  }

  async transitionPaymentState(id, targetStatus, userId, paymentReference = null) {
    const expense = await this.getExpenseById(id);

    // Enforce approved workflow
    if (targetStatus === 'PENDING_PAYMENT') {
      if (expense.status !== 'APPROVED') {
        throw new ApiError(400, `Cannot queue for PENDING_PAYMENT unless expense is APPROVED. Current status: ${expense.status}`);
      }
    } else if (targetStatus === 'PROCESSING_PAYMENT') {
      if (!['APPROVED', 'PENDING_PAYMENT'].includes(expense.status)) {
        throw new ApiError(400, `Cannot mark PROCESSING_PAYMENT from status: ${expense.status}`);
      }
    } else if (targetStatus === 'PAID') {
      if (!['APPROVED', 'PENDING_PAYMENT', 'PROCESSING_PAYMENT'].includes(expense.status)) {
        throw new ApiError(400, `Cannot mark PAID from status: ${expense.status}`);
      }
    } else {
      throw new ApiError(400, `Invalid target payment status: ${targetStatus}`);
    }

    return expenseRepository.transitionPaymentState(id, targetStatus, userId, paymentReference);
  }

  async softDeleteExpense(id) {
    const expense = await this.getExpenseById(id);
    if (['APPROVED', 'PENDING_PAYMENT', 'PROCESSING_PAYMENT', 'PAID'].includes(expense.status)) {
      throw new ApiError(400, `Cannot delete an expense in status ${expense.status}. Approved financial records are locked.`);
    }

    return expenseRepository.softDeleteExpense(id);
  }

  async getExpenseTimeline(id) {
    const expense = await this.getExpenseById(id);

    let approvalDuration = null;
    if (expense.submittedAt && expense.approvedAt) {
      approvalDuration = Math.round((new Date(expense.approvedAt).getTime() - new Date(expense.submittedAt).getTime()) / 1000);
    }

    let paymentDuration = null;
    if (expense.approvedAt && expense.paidAt) {
      paymentDuration = Math.round((new Date(expense.paidAt).getTime() - new Date(expense.approvedAt).getTime()) / 1000);
    }

    return {
      expenseId: expense.id,
      expenseNumber: expense.expenseNumber,
      status: expense.status,
      createdAt: expense.createdAt,
      submittedAt: expense.submittedAt || null,
      approvedAt: expense.approvedAt || null,
      rejectedAt: expense.rejectedAt || null,
      paidAt: expense.paidAt || null,
      approvalDuration,
      paymentDuration,
    };
  }

  async getExpenseKPIs() {
    return expenseRepository.getExpenseKPIs();
  }
}

module.exports = new ExpenseService();
