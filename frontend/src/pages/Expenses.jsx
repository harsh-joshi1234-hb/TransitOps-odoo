import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  TrendingUp,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Building2,
  Tag,
  CreditCard,
  X,
  History
} from 'lucide-react';
import { useExpenses, useExpenseKPIs, useExpenseTimeline, useCreateExpense, useTransitionExpense } from '../features/expenses/api/useExpenses';
import { useDebounce } from '../hooks/useDebounce';


const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  SUBMITTED: { label: 'Submitted', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  APPROVED: { label: 'Approved', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  PENDING_PAYMENT: { label: 'Pending Payment', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  PROCESSING_PAYMENT: { label: 'Processing Payment', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  PAID: { label: 'Paid', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  REJECTED: { label: 'Rejected', color: 'bg-rose-100 text-rose-800 border-rose-300' },
};

export default function Expenses() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [selectedTimelineId, setSelectedTimelineId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    type: 'FUEL',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    vendor: '',
    receiptNumber: '',
    description: '',
  });

  // Queries & Mutations
  const { data: expensesRes, isLoading: loadingExpenses } = useExpenses({ 
    status: statusFilter, 
    type: typeFilter,
    search: debouncedSearch 
  });
  
  const { data: kpisRes, isLoading: loadingKpis } = useExpenseKPIs();
  
  const { data: timelineRes } = useExpenseTimeline(selectedTimelineId);

  const createMutation = useCreateExpense();
  const transitionMutation = useTransitionExpense();

  const expenses = expensesRes?.data || [];
  const kpis = kpisRes?.data || null;

  // Duplicate Check Warning State
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Real-time local duplicate detection check
  useEffect(() => {
    if (!formData.amount || !formData.vendor || !expenses.length) {
      setDuplicateWarning(null);
      return;
    }
    const amt = parseFloat(formData.amount);
    const match = expenses.find(
      (e) =>
        e.vendor.toLowerCase() === formData.vendor.toLowerCase() &&
        Math.abs(e.amount - amt) < 0.01
    );
    if (match) {
      setDuplicateWarning(match);
    } else {
      setDuplicateWarning(null);
    }
  }, [formData.amount, formData.vendor, expenses]);

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString()
      });
      toast.success('Expense claim created successfully!');
      setShowCreateModal(false);
      setFormData({
        type: 'FUEL', amount: '', date: new Date().toISOString().slice(0, 10),
        vendor: '', receiptNumber: '', description: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create expense claim.');
    }
  };

  const handleLifecycleTransition = async (id, action) => {
    try {
      await transitionMutation.mutateAsync({ id, action });
      toast.success(`Expense ${action.replace('-', ' ')} successful`);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to transition expense`);
    }
  };

  const handleViewTimeline = (expense) => {
    setSelectedTimelineId(expense.id);
    setShowTimelineModal(true);
  };

  const formatDuration = (sec) => {
    if (!sec) return 'N/A';
    const hours = Math.round(sec / 3600);
    return `${hours} hrs`;
  };

  const filteredExpenses = expenses.filter((e) =>
    e.expenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.vendor?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Enterprise Expense Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            4-Factor Duplicate Detection • Multi-Level SoD Lifecycle • ACID Transactional Audit
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          New Expense Claim
        </button>
      </div>

      {/* KPI Cards Section */}
      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-center text-amber-600">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pending Approval</span>
              <Clock className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">${kpis.pendingApproval.amount.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">{kpis.pendingApproval.count} claims queued</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-center text-blue-600">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Approved Liability</span>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">${kpis.approvedExpenses.amount.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">{kpis.approvedExpenses.count} claims ready</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-center text-purple-600">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pending Payments</span>
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">${kpis.pendingPayments.amount.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">{kpis.pendingPayments.count} treasury batches</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-center text-emerald-600">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Paid Disbursed</span>
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">${kpis.paidExpenses.amount.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">{kpis.paidExpenses.count} settled claims</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-center text-indigo-600">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Avg Turnaround SLA</span>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <div className="text-lg font-bold text-gray-900">
                {formatDuration(kpis.averageApprovalTimeSeconds)} approval
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatDuration(kpis.averagePaymentTimeSeconds)} payment payout
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Expense ID (EXP-YYYYMMDD) or vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Lifecycle States</option>
            {Object.keys(STATUS_CONFIG).map((st) => (
              <option key={st} value={st}>{STATUS_CONFIG[st].label}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            <option value="FUEL">Fuel</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="TOLL">Toll</option>
            <option value="PARKING">Parking</option>
            <option value="FINE">Fine</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Expense Claims Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Expense ID</th>
              <th className="py-3.5 px-6">Vendor & Receipt</th>
              <th className="py-3.5 px-6">Category</th>
              <th className="py-3.5 px-6">Amount</th>
              <th className="py-3.5 px-6">Lifecycle Status</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredExpenses.map((exp) => {
              const cfg = STATUS_CONFIG[exp.status] || STATUS_CONFIG.DRAFT;
              return (
                <tr key={exp.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-4 px-6 font-semibold text-indigo-600">
                    {exp.expenseNumber}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{exp.vendor}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Receipt: {exp.receiptNumber || 'N/A'}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">
                      <Tag className="w-3.5 h-3.5 text-gray-500" />
                      {exp.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-900">
                    ${parseFloat(exp.amount).toFixed(2)}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => handleViewTimeline(exp)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                        title="View Audit Timeline & SLAs"
                      >
                        Timeline
                      </button>

                      {exp.status === 'SUBMITTED' && (
                        <>
                          <button
                            onClick={() => handleLifecycleTransition(exp.id, 'approve')}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleLifecycleTransition(exp.id, 'reject')}
                            className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {exp.status === 'APPROVED' && (
                        <button
                          onClick={() => handleLifecycleTransition(exp.id, 'pending-payment')}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                        >
                          Queue Payment
                        </button>
                      )}

                      {exp.status === 'PENDING_PAYMENT' && (
                        <button
                          onClick={() => handleLifecycleTransition(exp.id, 'processing-payment')}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                        >
                          Mark Processing
                        </button>
                      )}

                      {(exp.status === 'PROCESSING_PAYMENT' || exp.status === 'PENDING_PAYMENT') && (
                        <button
                          onClick={() => handleLifecycleTransition(exp.id, 'pay')}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">New Expense Claim</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Real-time Composite Duplicate Warning Banner */}
            {duplicateWarning && (
              <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <span className="font-bold">Duplicate Fingerprint Alert:</span> Existing claim{' '}
                  <span className="font-bold">{duplicateWarning.expenseNumber}</span> matches vendor &quot;
                  {duplicateWarning.vendor}&quot; and amount ${duplicateWarning.amount}. Please verify this is not a
                  duplicate reimbursement.
                </div>
              </div>
            )}

            <form onSubmit={handleCreateExpense} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Expense Category</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                >
                  <option value="FUEL">Fuel Expense</option>
                  <option value="MAINTENANCE">Fleet Maintenance</option>
                  <option value="TOLL">Highway Toll</option>
                  <option value="PARKING">Parking Fee</option>
                  <option value="FINE">Traffic Fine</option>
                  <option value="OTHER">Other Expense</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Vendor / Station</label>
                  <input
                    type="text"
                    required
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    placeholder="e.g. Shell #102"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Receipt Number (Optional)</label>
                <input
                  type="text"
                  value={formData.receiptNumber}
                  onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                  placeholder="e.g. INV-99042"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timeline Stepper Modal */}
      {showTimelineModal && selectedTimelineId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Lifecycle Audit Timeline</h3>
                <span className="text-xs font-semibold text-indigo-600">{selectedTimelineId}</span>
              </div>
              <button onClick={() => { setShowTimelineModal(false); setSelectedTimelineId(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Submitted</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {timelineRes?.data?.submittedAt
                      ? new Date(timelineRes.data.submittedAt).toLocaleString()
                      : 'Pending Submission'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Finance Approval</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {timelineRes?.data?.approvedAt
                      ? `${new Date(timelineRes.data.approvedAt).toLocaleString()} (${formatDuration(timelineRes.data.approvalDuration)} SLA)`
                      : 'Awaiting Manager Sign-off'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Disbursed & Paid</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {timelineRes?.data?.paidAt
                      ? `${new Date(timelineRes.data.paidAt).toLocaleString()} (${formatDuration(timelineRes.data.paymentDuration)} SLA)`
                      : 'Pending Treasury Clearing'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => { setShowTimelineModal(false); setSelectedTimelineId(null); }}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
