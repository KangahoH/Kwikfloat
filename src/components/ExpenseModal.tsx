import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ExpenseCategory } from '../types';
import { formatUGX } from '../utils/formatters';
import { X, Receipt, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpenseModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { wallets, recordExpense, currentUser } = useApp();

  const [category, setCategory] = useState<ExpenseCategory>('ELECTRICITY');
  const [amount, setAmount] = useState<string>('50000');
  const [paymentWalletId, setPaymentWalletId] = useState<string>(
    wallets.find((w) => w.branchId === currentUser.branchId && w.walletType === 'CASH')?.id || wallets[0]?.id || ''
  );
  const [description, setDescription] = useState<string>('');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const parsedAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;
  const selectedWallet = wallets.find((w) => w.id === paymentWalletId);

  const categories: { label: string; value: ExpenseCategory }[] = [
    { label: 'Electricity / Yaka Token', value: 'ELECTRICITY' },
    { label: 'Shop Rent', value: 'RENT' },
    { label: 'Internet / WiFi Data', value: 'INTERNET' },
    { label: 'Agent Salaries / Commission Payout', value: 'SALARIES' },
    { label: 'Transport / Float Banking', value: 'TRANSPORT' },
    { label: 'Airtime & Telecom SIM Fees', value: 'AIRTIME_FEES' },
    { label: 'Security Guard / Night Watch', value: 'SECURITY' },
    { label: 'Repairs & Maintenance', value: 'REPAIRS' },
    { label: 'Miscellaneous Expenses', value: 'MISCELLANEOUS' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (parsedAmount <= 0) {
      setError('Please enter a valid expense amount');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a brief description for this expense');
      return;
    }

    if (!selectedWallet) {
      setError('Please select a payment wallet');
      return;
    }

    if (selectedWallet.currentBalance < parsedAmount) {
      setError(`Insufficient funds in ${selectedWallet.accountName}. Available: ${formatUGX(selectedWallet.currentBalance)}`);
      return;
    }

    setIsSubmitting(true);
    const res = recordExpense({
      category,
      amount: parsedAmount,
      paymentWalletId,
      description: description.trim(),
      receiptNumber: receiptNumber.trim() || undefined,
      expenseDate,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Failed to record expense');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Record Operational Expense</h2>
              <p className="text-xs text-slate-400">Post operational cost and debit selected register</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Expense Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Expense Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600"
              required
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Amount (UGX)
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setAmount(val ? parseInt(val, 10).toLocaleString('en-US') : '');
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600"
                required
              />
            </div>
          </div>

          {/* Payment Wallet */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Paid From (Wallet / Drawer)
            </label>
            <select
              value={paymentWalletId}
              onChange={(e) => setPaymentWalletId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600"
              required
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.accountName} ({formatUGX(w.currentBalance)}) - {w.branchName}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Expense Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Umeme prepaid token 50 units for October"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600"
              required
            />
          </div>

          {/* Receipt Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Receipt / Invoice Ref <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              placeholder="e.g. REC-99201 or YAKA-TOKEN-2918"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || parsedAmount <= 0}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Recording...' : 'Debit Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
