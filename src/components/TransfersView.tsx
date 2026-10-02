import React from 'react';
import { useApp } from '../context/AppContext';
import { formatUGX, formatDateTime } from '../utils/formatters';
import { ArrowRightLeft, Plus, Building, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  onOpenTransfer: () => void;
}

export const TransfersView: React.FC<Props> = ({ onOpenTransfer }) => {
  const { transfers, activeBranchId } = useApp();

  const filteredTransfers = transfers.filter(
    (tr) => activeBranchId === 'ALL' || tr.branchId === activeBranchId
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Wallet & Float Transfers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Internal capital movements: MTN ↔ Airtel, Cash ↔ MTN/Airtel, Bank ↔ Float.
          </p>
        </div>

        <button
          onClick={onOpenTransfer}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          New Float Transfer
        </button>
      </div>

      {/* Info Callout */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-start gap-3">
        <ArrowRightLeft className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Pure Internal Rebalancing (PRD Section 7):</p>
          <p className="text-indigo-800 mt-0.5">
            Float transfers are recorded as paired double-entry ledger transactions (one debit, one credit) rather than customer transactions. This keeps customer revenue and commission accounting strictly separated from capital rebalancing.
          </p>
        </div>
      </div>

      {/* Transfers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Transfer Number & Date</th>
                <th className="py-3 px-4">Source Wallet (Debited)</th>
                <th className="py-3 px-4 text-center">Movement</th>
                <th className="py-3 px-4">Destination Wallet (Credited)</th>
                <th className="py-3 px-4 text-right">Amount (UGX)</th>
                <th className="py-3 px-4">Reason / Reference</th>
                <th className="py-3 px-4">Initiated By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No float transfers recorded.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Transfer Num & Date */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{tr.transferNumber}</span>
                      <span className="text-[10px] text-slate-400 block">{formatDateTime(tr.createdAt)}</span>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-rose-700 block">{tr.sourceWalletName}</span>
                    </td>

                    {/* Arrow */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </td>

                    {/* Destination */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-emerald-700 block">{tr.destinationWalletName}</span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 text-sm whitespace-nowrap">
                      {formatUGX(tr.amount)}
                      {tr.fee > 0 && (
                        <span className="block text-[10px] text-slate-400 font-normal">
                          Fee: {formatUGX(tr.fee)}
                        </span>
                      )}
                    </td>

                    {/* Reason */}
                    <td className="py-3 px-4 text-slate-600">
                      <span className="font-medium text-slate-800 block text-xs">{tr.reason}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">Ref: {tr.reference}</span>
                    </td>

                    {/* Initiated By */}
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {tr.createdBy}
                    </td>
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
