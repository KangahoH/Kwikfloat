import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Wallet, LedgerEntry, WalletType } from '../types';
import { formatUGX, formatDateTime } from '../utils/formatters';
import {
  BookOpenText,
  SlidersHorizontal,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface Props {
  onOpenTransfer: () => void;
}

export const WalletsLedgerView: React.FC<Props> = ({ onOpenTransfer }) => {
  const {
    wallets,
    ledgerEntries,
    activeBranchId,
    adjustWalletBalance,
    updateWalletThreshold,
    getWalletBalanceFromLedger,
    currentUser,
  } = useApp();

  const [selectedWalletId, setSelectedWalletId] = useState<string>('ALL');
  const [entryTypeFilter, setEntryTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Adjustment modal
  const [adjWallet, setAdjWallet] = useState<Wallet | null>(null);
  const [adjAmount, setAdjAmount] = useState<string>('');
  const [adjReason, setAdjReason] = useState<string>('');
  const [adjError, setAdjError] = useState<string | null>(null);

  // Filter wallets
  const filteredWallets = useMemo(() => {
    return wallets.filter((w) => activeBranchId === 'ALL' || w.branchId === activeBranchId);
  }, [wallets, activeBranchId]);

  // Filter ledger entries
  const filteredLedgerEntries = useMemo(() => {
    return ledgerEntries.filter((entry) => {
      // Wallet filter
      if (selectedWalletId !== 'ALL' && entry.walletId !== selectedWalletId) {
        return false;
      }
      // If branch filter is set and wallet filter is ALL, ensure entry's wallet is in active branch
      if (activeBranchId !== 'ALL' && selectedWalletId === 'ALL') {
        const belongsToBranch = filteredWallets.some((w) => w.id === entry.walletId);
        if (!belongsToBranch) return false;
      }
      // Entry type filter
      if (entryTypeFilter !== 'ALL' && entry.entryType !== entryTypeFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = entry.description.toLowerCase().includes(q);
        const matchRef = entry.reference.toLowerCase().includes(q);
        const matchWallet = entry.walletName.toLowerCase().includes(q);
        const matchBy = entry.performedBy.toLowerCase().includes(q);
        return matchDesc || matchRef || matchWallet || matchBy;
      }
      return true;
    });
  }, [ledgerEntries, selectedWalletId, activeBranchId, filteredWallets, entryTypeFilter, searchQuery]);

  const handleConfirmAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjWallet) return;
    const parsed = parseInt(adjAmount.replace(/[^0-9-]/g, ''), 10);
    if (isNaN(parsed) || parsed === 0) {
      setAdjError('Please enter a non-zero adjustment amount (positive or negative)');
      return;
    }
    if (!adjReason.trim()) {
      setAdjError('Please provide an official audit explanation');
      return;
    }

    adjustWalletBalance(adjWallet.id, parsed, adjReason.trim());
    setAdjWallet(null);
    setAdjAmount('');
    setAdjReason('');
    setAdjError(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              Authoritative Double-Entry Core
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Wallets & Immutable Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Balance = Opening Balance + SUM(Ledger Entries). All movements are audit-logged and immutable.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTransfer}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Transfer Float
          </button>
        </div>
      </div>

      {/* Wallet Accounts Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWallets.map((wallet) => {
          const ledgerBal = getWalletBalanceFromLedger(wallet.id);
          const isLow = wallet.minimumThreshold > 0 && wallet.currentBalance <= wallet.minimumThreshold;

          const badgeBg =
            wallet.walletType === 'MTN_FLOAT'
              ? 'bg-yellow-400 text-black'
              : wallet.walletType === 'AIRTEL_FLOAT'
              ? 'bg-red-600 text-white'
              : wallet.walletType === 'CASH'
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 text-white';

          return (
            <div
              key={wallet.id}
              className={`bg-white rounded-2xl p-5 border transition-all ${
                selectedWalletId === wallet.id
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs ${badgeBg}`}>
                    {wallet.walletType === 'MTN_FLOAT'
                      ? 'M'
                      : wallet.walletType === 'AIRTEL_FLOAT'
                      ? 'A'
                      : wallet.walletType === 'CASH'
                      ? 'C'
                      : 'B'}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{wallet.accountName}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Ref: {wallet.simNumberOrRef} • {wallet.branchName}
                    </p>
                  </div>
                </div>
                {isLow && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Low Float
                  </span>
                )}
              </div>

              {/* Balances */}
              <div className="space-y-1 mb-4">
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono block">
                  {formatUGX(wallet.currentBalance)}
                </span>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Opening: {formatUGX(wallet.openingBalance)}</span>
                  <span>Safety Min: {formatUGX(wallet.minimumThreshold)}</span>
                </div>
              </div>

              {/* Action row */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedWalletId(selectedWalletId === wallet.id ? 'ALL' : wallet.id)}
                  className={`font-semibold text-xs ${
                    selectedWalletId === wallet.id ? 'text-indigo-600 underline' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {selectedWalletId === wallet.id ? 'Viewing Ledger' : 'Filter Ledger'}
                </button>

                {currentUser.role !== 'AGENT' && (
                  <button
                    onClick={() => {
                      setAdjWallet(wallet);
                      setAdjAmount('');
                      setAdjReason('');
                      setAdjError(null);
                    }}
                    className="text-[11px] text-slate-500 hover:text-indigo-600 underline font-medium"
                  >
                    Adjust Balance
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ledger Section Header & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ledger entries by description, reference, or agent..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {/* Wallet filter */}
          <select
            value={selectedWalletId}
            onChange={(e) => setSelectedWalletId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Wallets ({filteredWallets.length})</option>
            {filteredWallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.accountName}
              </option>
            ))}
          </select>

          {/* Entry Type filter */}
          <select
            value={entryTypeFilter}
            onChange={(e) => setEntryTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Entry Types</option>
            <option value="CUSTOMER_DEPOSIT">Customer Deposit (Cash In)</option>
            <option value="CUSTOMER_WITHDRAWAL">Customer Withdrawal (Cash Out)</option>
            <option value="CUSTOMER_AIRTIME">Customer Airtime Loading</option>
            <option value="FLOAT_TRANSFER_IN">Float Transfer In</option>
            <option value="FLOAT_TRANSFER_OUT">Float Transfer Out</option>
            <option value="EXPENSE_PAYMENT">Expense Payment</option>
            <option value="FLOAT_TOPUP">Float Top-up / Day Opening</option>
            <option value="REVERSAL">Reversal</option>
            <option value="BALANCE_ADJUSTMENT">Manual Adjustment</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Displaying <strong className="text-slate-800">{filteredLedgerEntries.length}</strong> of{' '}
            {ledgerEntries.length} immutable ledger transactions
          </span>
          <span className="font-mono text-[11px] text-slate-500">
            Authoritative source of truth for audits
          </span>
        </div>
      </div>

      {/* The Authoritative Ledger Entries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Ledger ID & Date</th>
                <th className="py-3 px-4">Target Wallet</th>
                <th className="py-3 px-4">Entry Type</th>
                <th className="py-3 px-4">Reference & Description</th>
                <th className="py-3 px-4 text-right">Delta Amount (UGX)</th>
                <th className="py-3 px-4 text-right">Balance Before</th>
                <th className="py-3 px-4 text-right">Balance After</th>
                <th className="py-3 px-4">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredLedgerEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                    No ledger entries found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredLedgerEntries.map((entry) => {
                  const isPositive = entry.amount >= 0;
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* ID & Date */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{entry.id}</span>
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {formatDateTime(entry.createdAt)}
                        </span>
                      </td>

                      {/* Wallet */}
                      <td className="py-3 px-4 font-sans">
                        <span className="font-bold text-slate-800 block text-xs truncate max-w-[150px]">
                          {entry.walletName}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{entry.walletType}</span>
                      </td>

                      {/* Entry Type */}
                      <td className="py-3 px-4 font-sans">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 block w-fit">
                          {entry.entryType.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Reference & Description */}
                      <td className="py-3 px-4 font-sans">
                        <span className="font-bold text-slate-800 block text-xs">{entry.reference}</span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[220px]">
                          {entry.description}
                        </span>
                      </td>

                      {/* Delta Amount */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-extrabold text-sm ${
                            isPositive ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isPositive ? `+${formatUGX(entry.amount)}` : formatUGX(entry.amount)}
                        </span>
                      </td>

                      {/* Balance Before */}
                      <td className="py-3 px-4 text-right text-slate-500 whitespace-nowrap">
                        {formatUGX(entry.balanceBefore)}
                      </td>

                      {/* Balance After */}
                      <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatUGX(entry.balanceAfter)}
                      </td>

                      {/* Performed By */}
                      <td className="py-3 px-4 font-sans text-slate-600">
                        <span className="font-medium text-slate-800">{entry.performedBy}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Balance Adjustment Modal */}
      {adjWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Adjust {adjWallet.accountName}
              </h3>
              <button
                onClick={() => setAdjWallet(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Current balance: <strong className="font-mono text-slate-900">{formatUGX(adjWallet.currentBalance)}</strong>.
              Enter positive value to credit or negative value to debit. This will create an immutable audit adjustment ledger entry.
            </p>

            {adjError && (
              <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg">{adjError}</div>
            )}

            <form onSubmit={handleConfirmAdjustment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Adjustment Amount (UGX)
                </label>
                <input
                  type="text"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(e.target.value)}
                  placeholder="e.g. 50000 or -50000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Audit Justification / Explanation
                </label>
                <textarea
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder="e.g. Bank till reconciliation discrepancy cleared by Auditor, or USSD float fee adjustment"
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjWallet(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Commit Ledger Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
