import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatUGX, formatDateTime } from '../utils/formatters';
import { Receipt, Plus, Sparkles, Building2, Tag } from 'lucide-react';

interface Props {
  onOpenExpense: () => void;
}

export const ExpensesView: React.FC<Props> = ({ onOpenExpense }) => {
  const { expenses, activeBranchId } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredExpenses = expenses.filter((e) => {
    if (activeBranchId !== 'ALL' && e.branchId !== activeBranchId) return false;
    if (categoryFilter !== 'ALL' && e.category !== categoryFilter) return false;
    return true;
  });

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Category breakdown
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Operational Expenses Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track overhead costs: Yaka power, shop rent, transport, airtime fees, and salaries.
          </p>
        </div>

        <button
          onClick={onOpenExpense}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Record Expense
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Logged Expenses
          </span>
          <span className="text-2xl font-extrabold text-rose-700 font-mono block mt-1">
            {formatUGX(totalExpenseAmount)}
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">{filteredExpenses.length} expense entries</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs col-span-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Top Categories
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(categoryTotals).map(([cat, amt]) => (
              <span key={cat} className="px-2.5 py-1 bg-slate-100 rounded-lg font-mono text-slate-700">
                <strong>{cat}:</strong> {formatUGX(amt)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Expense Records
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Categories</option>
            <option value="ELECTRICITY">Electricity / Yaka</option>
            <option value="RENT">Rent</option>
            <option value="INTERNET">Internet</option>
            <option value="SALARIES">Salaries</option>
            <option value="TRANSPORT">Transport</option>
            <option value="SECURITY">Security</option>
            <option value="MISCELLANEOUS">Miscellaneous</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Paid From (Wallet)</th>
                <th className="py-3 px-4 text-right">Amount (UGX)</th>
                <th className="py-3 px-4">Receipt Ref</th>
                <th className="py-3 px-4">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600">{exp.expenseDate}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{exp.description}</td>
                    <td className="py-3 px-4 text-slate-600">{exp.paymentWalletName}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-700 whitespace-nowrap">
                      -{formatUGX(exp.amount)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {exp.receiptNumber || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{exp.recordedBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
