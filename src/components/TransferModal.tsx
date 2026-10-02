import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatUGX } from '../utils/formatters';
import { X, ArrowRightLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { wallets, executeFloatTransfer, currentUser } = useApp();

  const [sourceWalletId, setSourceWalletId] = useState<string>(wallets[0]?.id || '');
  const [destWalletId, setDestWalletId] = useState<string>(wallets[1]?.id || '');
  const [amount, setAmount] = useState<string>('500000');
  const [fee, setFee] = useState<string>('0');
  const [reason, setReason] = useState<string>('Float rebalancing between registers');
  const [reference, setReference] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const parsedAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;
  const parsedFee = parseInt(fee.replace(/[^0-9]/g, ''), 10) || 0;

  const sourceWallet = wallets.find((w) => w.id === sourceWalletId);
  const destWallet = wallets.find((w) => w.id === destWalletId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (sourceWalletId === destWalletId) {
      setError('Source and Destination wallets cannot be identical');
      return;
    }

    if (parsedAmount <= 0) {
      setError('Please enter a valid transfer amount');
      return;
    }

    if (!sourceWallet) {
      setError('Source wallet not selected');
      return;
    }

    if (sourceWallet.currentBalance < parsedAmount + parsedFee) {
      setError(
        `Insufficient balance in ${sourceWallet.accountName}. Available: ${formatUGX(sourceWallet.currentBalance)}`
      );
      return;
    }

    setIsSubmitting(true);
    const res = executeFloatTransfer({
      sourceWalletId,
      destinationWalletId: destWalletId,
      amount: parsedAmount,
      fee: parsedFee,
      reason,
      reference: reference.trim() || undefined,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Failed to complete float transfer');
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
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Wallet & Float Transfer</h2>
              <p className="text-xs text-slate-400">Rebalance cash, MTN float, Airtel float, or bank reserve</p>
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

          {/* Source Wallet */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Source Wallet (Deducted)
            </label>
            <select
              value={sourceWalletId}
              onChange={(e) => setSourceWalletId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              required
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.accountName} ({formatUGX(w.currentBalance)}) - {w.branchName}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Wallet */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Destination Wallet (Credited)
            </label>
            <select
              value={destWalletId}
              onChange={(e) => setDestWalletId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              required
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.accountName} ({formatUGX(w.currentBalance)}) - {w.branchName}
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Transfer Amount (UGX)
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setAmount(val ? parseInt(val, 10).toLocaleString('en-US') : '');
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Bank / Carrier Fee <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={fee}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setFee(val ? parseInt(val, 10).toLocaleString('en-US') : '0');
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason / Purpose
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Buying MTN float from cash drawer, Rebalancing Nakawa till"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              required
            />
          </div>

          {/* Reference */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reference / Bank Slip # <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. STANBIC-TRF-90234 or USSD-REF-891"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {/* Preview */}
          {sourceWallet && destWallet && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 space-y-1">
              <span className="font-bold block">Ledger Impact Preview:</span>
              <p>
                • {sourceWallet.accountName}:{' '}
                <span className="font-mono text-red-600 font-semibold">
                  -{formatUGX(parsedAmount + parsedFee)}
                </span>{' '}
                (New: {formatUGX(sourceWallet.currentBalance - (parsedAmount + parsedFee))})
              </p>
              <p>
                • {destWallet.accountName}:{' '}
                <span className="font-mono text-emerald-600 font-semibold">
                  +{formatUGX(parsedAmount)}
                </span>{' '}
                (New: {formatUGX(destWallet.currentBalance + parsedAmount)})
              </p>
            </div>
          )}

          {/* Actions */}
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
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Transferring...' : 'Execute Float Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
