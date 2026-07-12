const prisma = require('../config/prisma');

class ExpenseRepository {
  async getLatestExpenseForDate(datePrefix) {
    return prisma.expense.findFirst({
      where: {
        expenseNumber: {
          startsWith: datePrefix,
        },
      },
      orderBy: {
        expenseNumber: 'desc',
      },
    });
  }

  async findDuplicateExpense({ vendor, date, amount, receiptNumber }) {
    const whereClause = {
      isDeleted: false,
      amount: amount,
    };

    if (vendor) {
      whereClause.vendor = { equals: vendor, mode: 'insensitive' };
    }

    if (receiptNumber) {
      whereClause.receiptNumber = receiptNumber;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereClause.date = { gte: startOfDay, lte: endOfDay };
    }

    return prisma.expense.findFirst({
      where: whereClause,
      include: {
        vehicle: { select: { id: true, registrationNumber: true } },
      },
    });
  }

  async createExpense(data) {
    return prisma.expense.create({
      data,
      include: {
        vehicle: { select: { id: true, registrationNumber: true, name: true } },
        trip: { select: { id: true, tripNumber: true } },
        createdByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async findExpenseById(id) {
    return prisma.expense.findUnique({
      where: { id, isDeleted: false },
      include: {
        vehicle: { select: { id: true, registrationNumber: true, name: true, type: true } },
        trip: { select: { id: true, tripNumber: true, source: true, destination: true } },
        createdByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        approvedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        paidByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async findAllExpenses({ filters, sort, pagination }) {
    const { status, type, vehicleId, tripId, search, startDate, endDate } = filters;
    const { sortBy = 'date', sortOrder = 'desc' } = sort;
    const { skip, take } = pagination;

    const where = { isDeleted: false };

    if (status) where.status = status;
    if (type) where.type = type;
    if (vehicleId) where.vehicleId = vehicleId;
    if (tripId) where.tripId = tripId;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { expenseNumber: { contains: search, mode: 'insensitive' } },
        { vendor: { contains: search, mode: 'insensitive' } },
        { receiptNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take,
        include: {
          vehicle: { select: { id: true, registrationNumber: true } },
          trip: { select: { id: true, tripNumber: true } },
          createdByUser: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.expense.count({ where }),
    ]);

    return { expenses, total };
  }

  async updateExpense(id, data) {
    return prisma.expense.update({
      where: { id },
      data,
      include: {
        vehicle: { select: { id: true, registrationNumber: true } },
        trip: { select: { id: true, tripNumber: true } },
      },
    });
  }

  // TRANSACTION: Submit Expense
  async submitExpense(id) {
    return prisma.$transaction(async (tx) => {
      return tx.expense.update({
        where: { id },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
        },
      });
    });
  }

  // TRANSACTION: Approve Expense
  async approveExpense(id, approvedByUserId) {
    return prisma.$transaction(async (tx) => {
      return tx.expense.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedByUserId,
          approvedAt: new Date(),
        },
      });
    });
  }

  // TRANSACTION: Reject Expense
  async rejectExpense(id, rejectionReason) {
    return prisma.$transaction(async (tx) => {
      return tx.expense.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectedAt: new Date(),
          rejectionReason,
        },
      });
    });
  }

  // TRANSACTION: Payment Workflow (APPROVED -> PENDING_PAYMENT -> PROCESSING_PAYMENT -> PAID)
  async transitionPaymentState(id, nextStatus, userId, paymentReference = null) {
    return prisma.$transaction(async (tx) => {
      const updateData = { status: nextStatus };

      if (nextStatus === 'PAID') {
        updateData.paidAt = new Date();
        updateData.paidByUserId = userId;
        if (paymentReference) {
          updateData.paymentReference = paymentReference;
        }
      }

      return tx.expense.update({
        where: { id },
        data: updateData,
      });
    });
  }

  async softDeleteExpense(id) {
    return prisma.expense.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async getExpenseKPIs() {
    const allExpenses = await prisma.expense.findMany({
      where: { isDeleted: false },
    });

    let pendingApprovalCount = 0;
    let pendingApprovalAmount = 0;
    let approvedCount = 0;
    let approvedAmount = 0;
    let rejectedCount = 0;
    let pendingPaymentsCount = 0;
    let pendingPaymentsAmount = 0;
    let paidCount = 0;
    let paidAmount = 0;

    let totalApprovalDurationSec = 0;
    let approvalDurationSamples = 0;

    let totalPaymentDurationSec = 0;
    let paymentDurationSamples = 0;

    const categoryDistribution = {};
    const monthlyTrendMap = {};

    for (const exp of allExpenses) {
      // Status counters
      if (exp.status === 'SUBMITTED') {
        pendingApprovalCount++;
        pendingApprovalAmount += exp.amount;
      } else if (exp.status === 'APPROVED') {
        approvedCount++;
        approvedAmount += exp.amount;
      } else if (exp.status === 'REJECTED') {
        rejectedCount++;
      } else if (exp.status === 'PENDING_PAYMENT' || exp.status === 'PROCESSING_PAYMENT') {
        pendingPaymentsCount++;
        pendingPaymentsAmount += exp.amount;
      } else if (exp.status === 'PAID') {
        paidCount++;
        paidAmount += exp.amount;
      }

      // SLAs
      if (exp.submittedAt && exp.approvedAt) {
        const durSec = (new Date(exp.approvedAt).getTime() - new Date(exp.submittedAt).getTime()) / 1000;
        if (durSec >= 0) {
          totalApprovalDurationSec += durSec;
          approvalDurationSamples++;
        }
      }

      if (exp.approvedAt && exp.paidAt) {
        const durSec = (new Date(exp.paidAt).getTime() - new Date(exp.approvedAt).getTime()) / 1000;
        if (durSec >= 0) {
          totalPaymentDurationSec += durSec;
          paymentDurationSamples++;
        }
      }

      // Category distribution
      const cat = exp.type || 'OTHER';
      if (!categoryDistribution[cat]) categoryDistribution[cat] = { count: 0, amount: 0 };
      categoryDistribution[cat].count++;
      categoryDistribution[cat].amount += exp.amount;

      // Monthly Trend (YYYY-MM)
      const monthKey = new Date(exp.date).toISOString().slice(0, 7);
      if (!monthlyTrendMap[monthKey]) monthlyTrendMap[monthKey] = 0;
      monthlyTrendMap[monthKey] += exp.amount;
    }

    const averageApprovalTimeSeconds = approvalDurationSamples > 0
      ? Math.round(totalApprovalDurationSec / approvalDurationSamples)
      : 0;

    const averagePaymentTimeSeconds = paymentDurationSamples > 0
      ? Math.round(totalPaymentDurationSec / paymentDurationSamples)
      : 0;

    const monthlyTrend = Object.keys(monthlyTrendMap)
      .sort()
      .map((month) => ({
        month,
        amount: parseFloat(monthlyTrendMap[month].toFixed(2)),
      }));

    return {
      pendingApproval: { count: pendingApprovalCount, amount: parseFloat(pendingApprovalAmount.toFixed(2)) },
      approvedExpenses: { count: approvedCount, amount: parseFloat(approvedAmount.toFixed(2)) },
      rejectedExpenses: { count: rejectedCount },
      pendingPayments: { count: pendingPaymentsCount, amount: parseFloat(pendingPaymentsAmount.toFixed(2)) },
      paidExpenses: { count: paidCount, amount: parseFloat(paidAmount.toFixed(2)) },
      averageApprovalTimeSeconds,
      averagePaymentTimeSeconds,
      monthlyExpenseTrend: monthlyTrend,
      expenseDistributionByCategory: categoryDistribution,
    };
  }
}

module.exports = new ExpenseRepository();
