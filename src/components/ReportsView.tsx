import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatUGX, formatCompactUGX } from '../utils/formatters';
import { BarChart3, Download, Printer, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { transactions, expenses, wallets, activeBranchId } = useApp();

  const [dateRange, setDateRange] = useState<'TODAY' | 'ALL'>('ALL');

  const todayStr = new Date().toISOString().slice(0, 10);

  const filteredTransactions = transactions.filter((t) => {
    if (activeBranchId !== 'ALL' && t.branchId !== activeBranchId) return false;
    if (dateRange === 'TODAY' && !t.transactionDate.startsWith(todayStr)) return false;
    return t.status === 'COMPLETED';
  });

  const filteredExpenses = expenses.filter((e) => {
    if (activeBranchId !== 'ALL' && e.branchId !== activeBranchId) return false;
    if (dateRange === 'TODAY' && e.expenseDate !== todayStr) return false;
    return true;
  });

  // Gross Commissions
  const mtnCommissions = filteredTransactions
    .filter((t) => t.provider === 'MTN')
    .reduce((sum, t) => sum + t.commission, 0);

  const airtelCommissions = filteredTransactions
    .filter((t) => t.provider === 'AIRTEL')
    .reduce((sum, t) => sum + t.commission, 0);

  const totalCommissions = mtnCommissions + airtelCommissions;

  // Expenses
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Net Profit
  const netProfit = totalCommissions - totalExpenses;

  // Volume
  const mtnVolume = filteredTransactions
    .filter((t) => t.provider === 'MTN')
    .reduce((sum, t) => sum + t.amount, 0);
  const airtelVolume = filteredTransactions
    .filter((t) => t.provider === 'AIRTEL')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalVolume = mtnVolume + airtelVolume;

  const depositVolume = filteredTransactions
    .filter((t) => t.type === 'DEPOSIT')
    .reduce((sum, t) => sum + t.amount, 0);
  const withdrawalVolume = filteredTransactions
    .filter((t) => t.type === 'WITHDRAWAL')
    .reduce((sum, t) => sum + t.amount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Financial & Profitability Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            P&L statement, commission yield, expense deductions, and liquidity movements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Recorded History</option>
            <option value="TODAY">Today Only</option>
          </select>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* P&L Statement Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Profit & Loss (P&L) Statement</h2>
            <p className="text-xs text-slate-500">Period: {dateRange === 'TODAY' ? `Today (${todayStr})` : 'All Dates'}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Net Operating Profit</span>
            <span
              className={`text-2xl font-extrabold font-mono ${
                netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {formatUGX(netProfit)}
            </span>
          </div>
        </div>

        {/* Breakdown Items */}
        <div className="space-y-4 font-mono text-xs">
          {/* Revenue */}
          <div>
            <div className="flex justify-between font-bold text-slate-900 text-sm pb-1 border-b border-slate-100 font-sans">
              <span>Gross Commission Revenue</span>
              <span className="text-emerald-700 font-mono">{formatUGX(totalCommissions)}</span>
            </div>
            <div className="pt-2 pl-4 space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>• MTN Mobile Money Commission Revenue:</span>
                <span>{formatUGX(mtnCommissions)}</span>
              </div>
              <div className="flex justify-between">
                <span>• Airtel Money Commission Revenue:</span>
                <span>{formatUGX(airtelCommissions)}</span>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div>
            <div className="flex justify-between font-bold text-slate-900 text-sm pb-1 border-b border-slate-100 font-sans">
              <span>Operating Overhead Expenses</span>
              <span className="text-rose-700 font-mono">-{formatUGX(totalExpenses)}</span>
            </div>
            <div className="pt-2 pl-4 space-y-1.5 text-slate-600">
              {filteredExpenses.map((e) => (
                <div key={e.id} className="flex justify-between">
                  <span>• {e.description} ({e.category}):</span>
                  <span className="text-rose-600">-{formatUGX(e.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Net Bottom Line */}
          <div className="pt-3 border-t-2 border-slate-900 flex justify-between font-sans font-extrabold text-base text-slate-900">
            <span>NET OPERATING COMMISSION PROFIT:</span>
            <span
              className={`font-mono text-lg ${
                netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {formatUGX(netProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Volume & Turnover breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MTN vs Airtel Volume */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Provider Turnover Comparison</h3>
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex justify-between font-sans mb-1">
                <span className="font-bold text-slate-900">MTN MoMo Volume</span>
                <span className="font-bold text-yellow-800">
                  {totalVolume > 0 ? `${Math.round((mtnVolume / totalVolume) * 100)}%` : '0%'}
                </span>
              </div>
              <span className="text-lg font-extrabold text-slate-900">{formatUGX(mtnVolume)}</span>
            </div>

            <div className="p-3 bg-red-50 rounded-xl border border-red-200">
              <div className="flex justify-between font-sans mb-1">
                <span className="font-bold text-slate-900">Airtel Money Volume</span>
                <span className="font-bold text-red-800">
                  {totalVolume > 0 ? `${Math.round((airtelVolume / totalVolume) * 100)}%` : '0%'}
                </span>
              </div>
              <span className="text-lg font-extrabold text-slate-900">{formatUGX(airtelVolume)}</span>
            </div>
          </div>
        </div>

        {/* Deposit vs Withdrawal Turnover */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Flow Turnover Breakdown</h3>
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex justify-between font-sans mb-1">
                <span className="font-bold text-slate-900">Cash In (Deposits) Volume</span>
                <span className="font-bold text-blue-800">
                  {totalVolume > 0 ? `${Math.round((depositVolume / totalVolume) * 100)}%` : '0%'}
                </span>
              </div>
              <span className="text-lg font-extrabold text-slate-900">{formatUGX(depositVolume)}</span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex justify-between font-sans mb-1">
                <span className="font-bold text-slate-900">Cash Out (Withdrawals) Volume</span>
                <span className="font-bold text-emerald-800">
                  {totalVolume > 0 ? `${Math.round((withdrawalVolume / totalVolume) * 100)}%` : '0%'}
                </span>
              </div>
              <span className="text-lg font-extrabold text-slate-900">{formatUGX(withdrawalVolume)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
