import React from 'react';
import { Transaction } from '../types';
import { useApp } from '../context/AppContext';
import { formatUGX, formatDateTime, formatUgandanPhone } from '../utils/formatters';
import { X, Printer, CheckCircle, Smartphone } from 'lucide-react';

interface Props {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<Props> = ({ transaction, onClose }) => {
  const { getTariffBreakdown } = useApp();

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const isMTN = transaction.provider === 'MTN';
  const tariff = getTariffBreakdown(transaction.provider, transaction.type, transaction.amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Receipt Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction Slip</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                transaction.status === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {transaction.status}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thermal Slip Content */}
        <div className="p-6 font-mono text-xs space-y-4 print:p-0">
          {/* Business branding */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <div className="inline-block p-1.5 rounded-xl bg-slate-900 text-white font-sans font-extrabold text-sm mb-1">
              KWIKFLOAT UGANDA
            </div>
            <p className="text-[11px] text-slate-600 font-sans">{transaction.branchName}</p>
            <p className="text-[10px] text-slate-400">Mobile Money Authorized Agent</p>
          </div>

          {/* Provider badge */}
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500">Service:</span>
            <div className="flex items-center gap-1 font-bold">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isMTN ? 'bg-yellow-400' : 'bg-red-600'
                }`}
              />
              <span className={isMTN ? 'text-yellow-700' : 'text-red-700'}>
                {transaction.provider} {transaction.type === 'AIRTIME' ? 'Airtime Recharge' : transaction.type}
              </span>
            </div>
          </div>

          {/* Amount Display */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="text-[11px] text-slate-500 uppercase block font-sans">
              {transaction.type === 'WITHDRAWAL'
                ? 'Cash Payout To Customer'
                : transaction.type === 'DEPOSIT'
                ? 'Cash Deposited (Cash In)'
                : 'Airtime Face Value'}
            </span>
            <span className="text-xl font-extrabold text-slate-900 block font-mono">
              {formatUGX(transaction.amount)}
            </span>
          </div>

          {/* Official Tariff Breakdown */}
          {transaction.type === 'WITHDRAWAL' ? (
            <div className="p-2.5 bg-yellow-50/50 rounded-xl border border-yellow-200/80 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Network Withdrawal Fee:</span>
                <span className="font-bold text-slate-800 font-mono">{formatUGX(tariff.customerFee)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>0.5% Uganda MoMo Tax:</span>
                <span className="font-bold text-amber-800 font-mono">{formatUGX(tariff.govtTax)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold border-t border-yellow-200 pt-1">
                <span>Total MoMo Wallet Debit:</span>
                <span className="font-extrabold text-slate-900 font-mono">{formatUGX(tariff.totalCustomerCost)}</span>
              </div>
            </div>
          ) : (
            <div className="p-2 bg-emerald-50/60 rounded-xl border border-emerald-200 text-[11px] flex items-center justify-between text-emerald-900">
              <span className="font-sans font-medium">Customer Transaction Fee:</span>
              <span className="font-mono font-bold">FREE (0 UGX)</span>
            </div>
          )}

          {/* Key fields */}
          <div className="space-y-1.5 pt-1 text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Tx Number:</span>
              <span className="font-semibold text-slate-800">{transaction.transactionNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ref ID:</span>
              <span className="font-semibold text-slate-800">{transaction.providerReference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Customer Phone:</span>
              <span className="font-semibold text-slate-800">{formatUgandanPhone(transaction.customerPhone)}</span>
            </div>
            {transaction.customerName && (
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-semibold text-slate-800">{transaction.customerName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Date/Time:</span>
              <span>{formatDateTime(transaction.transactionDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Serving Agent:</span>
              <span>{transaction.agentName}</span>
            </div>
            {transaction.notes && (
              <div className="flex justify-between">
                <span className="text-slate-400">Notes:</span>
                <span className="truncate max-w-[150px]">{transaction.notes}</span>
              </div>
            )}
          </div>

          {/* Barcode / Sim placeholder */}
          <div className="pt-3 border-t border-dashed border-slate-300 text-center space-y-1">
            <div className="h-9 bg-slate-100 rounded flex items-center justify-center tracking-widest text-slate-400 font-mono text-[10px]">
              ||||| | |||| |||||| | ||||| ||| ||||
            </div>
            <p className="text-[10px] text-slate-400 font-sans">
              Thank you for transacting with us • Customer Helpline: 100 / 122
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-sans font-semibold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
