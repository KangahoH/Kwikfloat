import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction, Provider, TransactionType } from '../types';
import { formatUGX, formatDateTime, formatUgandanPhone } from '../utils/formatters';
import {
  Search,
  Filter,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Receipt,
  RotateCcw,
  Sparkles,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

interface Props {
  onOpenNewTx: () => void;
  onOpenReceipt: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<Props> = ({ onOpenNewTx, onOpenReceipt }) => {
  const { transactions, activeBranchId, reverseTransaction, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<'ALL' | Provider>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'REVERSED'>('ALL');

  // Reverse modal state
  const [txToReverse, setTxToReverse] = useState<Transaction | null>(null);
  const [reversalReason, setReversalReason] = useState('');
  const [reverseError, setReverseError] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Branch filter
      if (activeBranchId !== 'ALL' && tx.branchId !== activeBranchId) {
        return false;
      }
      // Provider filter
      if (providerFilter !== 'ALL' && tx.provider !== providerFilter) {
        return false;
      }
      // Type filter
      if (typeFilter !== 'ALL' && tx.type !== typeFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && tx.status !== statusFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchPhone = tx.customerPhone.includes(q);
        const matchName = tx.customerName?.toLowerCase().includes(q);
        const matchRef = tx.providerReference.toLowerCase().includes(q);
        const matchTxNum = tx.transactionNumber.toLowerCase().includes(q);
        const matchAgent = tx.agentName.toLowerCase().includes(q);
        return matchPhone || matchName || matchRef || matchTxNum || matchAgent;
      }
      return true;
    });
  }, [transactions, activeBranchId, providerFilter, typeFilter, statusFilter, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Transaction Number',
      'Date/Time',
      'Provider',
      'Type',
      'Customer Phone',
      'Customer Name',
      'Amount (UGX)',
      'Commission (UGX)',
      'Provider Reference',
      'Agent',
      'Branch',
      'Status',
    ];
    const rows = filteredTransactions.map((t) => [
      t.transactionNumber,
      t.transactionDate,
      t.provider,
      t.type,
      t.customerPhone,
      t.customerName || '',
      t.amount,
      t.commission,
      t.providerReference,
      t.agentName,
      t.branchName,
      t.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kwikfloat_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmReverse = () => {
    if (!txToReverse) return;
    if (!reversalReason.trim()) {
      setReverseError('Please provide an official justification for reversal');
      return;
    }
    const res = reverseTransaction(txToReverse.id, reversalReason.trim());
    if (!res.success) {
      setReverseError(res.error || 'Failed to reverse transaction');
      return;
    }
    setTxToReverse(null);
    setReversalReason('');
    setReverseError(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Transaction Register
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Log, verify, print slips, and manage MTN MoMo & Airtel Money customer transactions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={onOpenNewTx}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Record Transaction
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phone (077...), customer name, ref ID, or transaction number..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Provider Filter */}
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Providers</option>
              <option value="MTN">MTN MoMo</option>
              <option value="AIRTEL">Airtel Money</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="WITHDRAWAL">Cash Out (Withdrawals)</option>
              <option value="DEPOSIT">Cash In (Deposits)</option>
              <option value="AIRTIME">Load Airtime</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="REVERSED">Reversed</option>
            </select>
          </div>
        </div>

        {/* Count summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800">{filteredTransactions.length}</strong> of{' '}
            {transactions.length} records
          </span>
          <span className="font-mono">
            Total Filtered Volume:{' '}
            <strong className="text-slate-800 font-bold">
              {formatUGX(filteredTransactions.reduce((acc, t) => acc + t.amount, 0))}
            </strong>
          </span>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Tx Number & Ref</th>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Provider & Type</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4 text-right">Amount (UGX)</th>
                <th className="py-3 px-4 text-right">Commission</th>
                <th className="py-3 px-4">Agent / Branch</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No transactions found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isMTN = tx.provider === 'MTN';
                  const isDeposit = tx.type === 'DEPOSIT';
                  const isReversed = tx.status === 'REVERSED';

                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isReversed ? 'bg-slate-50/60 opacity-60' : ''
                      }`}
                    >
                      {/* Tx Number & Ref */}
                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-slate-900 block">{tx.transactionNumber}</span>
                        <span className="text-[10px] text-slate-400 block">{tx.providerReference}</span>
                      </td>

                      {/* Date/Time */}
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatDateTime(tx.transactionDate)}
                      </td>

                      {/* Provider & Type */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] ${
                              isMTN ? 'bg-yellow-400 text-black' : 'bg-red-600 text-white'
                            }`}
                          >
                            {isMTN ? 'M' : 'A'}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {tx.provider}{' '}
                              {tx.type === 'DEPOSIT'
                                ? 'Cash In'
                                : tx.type === 'AIRTIME'
                                ? 'Airtime'
                                : 'Cash Out'}
                            </span>
                            <span className="text-[10px] text-slate-400 block capitalize">
                              {tx.type === 'AIRTIME' ? 'Airtime Recharge' : isDeposit ? 'Deposit' : 'Withdrawal'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Customer Phone & Name */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-800 block">
                          {formatUgandanPhone(tx.customerPhone)}
                        </span>
                        {tx.customerName && (
                          <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                            {tx.customerName}
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 text-sm whitespace-nowrap">
                        {formatUGX(tx.amount)}
                      </td>

                      {/* Commission */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700 whitespace-nowrap">
                        +{formatUGX(tx.commission)}
                      </td>

                      {/* Agent / Branch */}
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-semibold text-slate-800 block">{tx.agentName}</span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                          {tx.branchName}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isReversed
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenReceipt(tx)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                            title="Print Slip"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>

                          {!isReversed && currentUser.role !== 'AGENT' && (
                            <button
                              onClick={() => {
                                setTxToReverse(tx);
                                setReversalReason('');
                                setReverseError(null);
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors"
                              title="Reverse Transaction"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reversal Confirmation Modal */}
      {txToReverse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-base">Reverse Transaction</h3>
              </div>
              <button
                onClick={() => setTxToReverse(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              You are about to reverse{' '}
              <strong className="text-slate-900 font-mono">{txToReverse.transactionNumber}</strong>{' '}
              (<strong>{formatUGX(txToReverse.amount)}</strong> {txToReverse.provider} {txToReverse.type}).
              This will automatically post counterbalancing double-entry ledger reversals to restore previous balances.
            </p>

            {reverseError && (
              <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-lg">{reverseError}</div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reversal Justification
              </label>
              <textarea
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                placeholder="Reason: e.g. Customer canceled transaction, incorrect phone number inputted, USSD timeout"
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setTxToReverse(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReverse}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Confirm Reversal & Post to Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
