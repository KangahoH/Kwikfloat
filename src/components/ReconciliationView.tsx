import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ReconciliationRecord } from '../types';
import { formatUGX, formatDateTime } from '../utils/formatters';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Plus,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Coins,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  onOpenRecon: () => void;
}

export const ReconciliationView: React.FC<Props> = ({ onOpenRecon }) => {
  const { reconciliations, activeBranchId, approveReconciliation, currentUser } = useApp();

  const [expandedId, setExpandedId] = useState<string | null>(
    reconciliations[0]?.id || null
  );

  const [approvalNotes, setApprovalNotes] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const filteredReconciliations = reconciliations.filter(
    (r) => activeBranchId === 'ALL' || r.branchId === activeBranchId
  );

  const handleApprove = (recId: string) => {
    approveReconciliation(recId, approvalNotes || 'Reviewed and signed off by auditor.');
    setApprovingId(null);
    setApprovalNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Financial Integrity & Control
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Daily End-Of-Day (EOD) Reconciliation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Compare physical cash drawer counts and USSD float balances against the double-entry ledger.
          </p>
        </div>

        <button
          onClick={onOpenRecon}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Scale className="w-4 h-4 text-emerald-400" />
          Run Daily EOD Reconciliation
        </button>
      </div>

      {/* Reconciliation Records List */}
      <div className="space-y-4">
        {filteredReconciliations.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            <Scale className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No reconciliations recorded yet.</p>
            <p className="text-xs text-slate-400 mt-1">Run an EOD reconciliation to balance today's cash and floats.</p>
          </div>
        ) : (
          filteredReconciliations.map((rec) => {
            const isExpanded = expandedId === rec.id;
            const isBalanced = rec.mtnVariance === 0 && rec.airtelVariance === 0 && rec.cashVariance === 0;
            const isLocked = rec.status === 'LOCKED';

            return (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                        isLocked
                          ? 'bg-slate-900 text-white'
                          : isBalanced
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {isLocked ? <Lock className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {rec.branchName} • {rec.date}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isLocked
                              ? 'bg-purple-100 text-purple-800'
                              : isBalanced
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rec.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Ref: {rec.reconciliationNumber} • Reconciled by: {rec.reconciledBy}
                      </p>
                    </div>
                  </div>

                  {/* Summary Variance Badges */}
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-sans">Variances:</span>
                      <span className="text-[11px] text-slate-600">
                        M: {formatUGX(rec.mtnVariance)} | A: {formatUGX(rec.airtelVariance)} | C: {formatUGX(rec.cashVariance)}
                      </span>
                    </div>

                    <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-6">
                    {/* 3 Columns: MTN, Airtel, Cash */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* MTN FLOAT BREAKDOWN */}
                      <div className="bg-white p-4 rounded-xl border border-yellow-200 space-y-2 text-xs font-mono">
                        <div className="flex items-center justify-between font-sans pb-2 border-b border-slate-100">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                            MTN Float Ledger
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              rec.mtnVariance === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {rec.mtnVariance === 0 ? 'Balanced' : `Var: ${formatUGX(rec.mtnVariance)}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Opening Float:</span>
                          <span>{formatUGX(rec.mtnOpening)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-600">
                          <span>+ Deposits (Cash In):</span>
                          <span>+{formatUGX(rec.mtnDeposits)}</span>
                        </div>
                        <div className="flex justify-between text-rose-600">
                          <span>- Withdrawals (Cash Out):</span>
                          <span>-{formatUGX(rec.mtnWithdrawals)}</span>
                        </div>
                        <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                          <span>System Expected:</span>
                          <span>{formatUGX(rec.mtnExpected)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-yellow-700">
                          <span>Phone SIM Actual:</span>
                          <span>{formatUGX(rec.mtnActual)}</span>
                        </div>
                        {rec.mtnVarianceReason && (
                          <p className="text-[11px] font-sans text-amber-800 italic pt-1 bg-amber-50 p-2 rounded">
                            "{rec.mtnVarianceReason}"
                          </p>
                        )}
                      </div>

                      {/* AIRTEL FLOAT BREAKDOWN */}
                      <div className="bg-white p-4 rounded-xl border border-red-200 space-y-2 text-xs font-mono">
                        <div className="flex items-center justify-between font-sans pb-2 border-b border-slate-100">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                            Airtel Float Ledger
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              rec.airtelVariance === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {rec.airtelVariance === 0 ? 'Balanced' : `Var: ${formatUGX(rec.airtelVariance)}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Opening Float:</span>
                          <span>{formatUGX(rec.airtelOpening)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-600">
                          <span>+ Deposits (Cash In):</span>
                          <span>+{formatUGX(rec.airtelDeposits)}</span>
                        </div>
                        <div className="flex justify-between text-rose-600">
                          <span>- Withdrawals (Cash Out):</span>
                          <span>-{formatUGX(rec.airtelWithdrawals)}</span>
                        </div>
                        <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                          <span>System Expected:</span>
                          <span>{formatUGX(rec.airtelExpected)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-red-700">
                          <span>Phone SIM Actual:</span>
                          <span>{formatUGX(rec.airtelActual)}</span>
                        </div>
                        {rec.airtelVarianceReason && (
                          <p className="text-[11px] font-sans text-rose-800 italic pt-1 bg-rose-50 p-2 rounded">
                            "{rec.airtelVarianceReason}"
                          </p>
                        )}
                      </div>

                      {/* CASH DRAWER BREAKDOWN */}
                      <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-2 text-xs font-mono">
                        <div className="flex items-center justify-between font-sans pb-2 border-b border-slate-100">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                            Physical Cash Drawer
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              rec.cashVariance === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {rec.cashVariance === 0 ? 'Balanced' : `Var: ${formatUGX(rec.cashVariance)}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Opening Cash:</span>
                          <span>{formatUGX(rec.cashOpening)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-600">
                          <span>+ Cash Out Inflow:</span>
                          <span>+{formatUGX(rec.cashWithdrawals)}</span>
                        </div>
                        <div className="flex justify-between text-rose-600">
                          <span>- Cash In Outflow:</span>
                          <span>-{formatUGX(rec.cashDeposits)}</span>
                        </div>
                        {rec.cashExpenses > 0 && (
                          <div className="flex justify-between text-rose-600">
                            <span>- Expenses:</span>
                            <span>-{formatUGX(rec.cashExpenses)}</span>
                          </div>
                        )}
                        <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                          <span>System Expected:</span>
                          <span>{formatUGX(rec.cashExpected)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-emerald-700">
                          <span>Physical Count:</span>
                          <span>{formatUGX(rec.cashActual)}</span>
                        </div>
                        {rec.cashVarianceReason && (
                          <p className="text-[11px] font-sans text-amber-800 italic pt-1 bg-amber-50 p-2 rounded">
                            "{rec.cashVarianceReason}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Denominations breakdown (if recorded) */}
                    {rec.cashDenominations && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                        <span className="font-bold text-slate-700 block mb-1">
                          Counted Banknotes & Coins
                        </span>
                        <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-600">
                          {Object.entries(rec.cashDenominations).map(([k, v]) => {
                            if (!v) return null;
                            return (
                              <span key={k} className="px-2 py-1 bg-slate-100 rounded-md">
                                {k.replace('c', '')} UGX × {v}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Sign-off & Lock controls */}
                    <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        {rec.approvedBy ? (
                          <div className="flex items-center gap-1.5 text-purple-700 font-semibold">
                            <ShieldCheck className="w-4 h-4" />
                            <span>
                              Approved and Locked by {rec.approvedBy} • Notes: {rec.approvalNotes || 'None'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">
                            Pending final auditor sign-off and period lock
                          </span>
                        )}
                      </div>

                      {!isLocked && currentUser.role !== 'AGENT' && (
                        <div>
                          {approvingId === rec.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={approvalNotes}
                                onChange={(e) => setApprovalNotes(e.target.value)}
                                placeholder="Auditor approval note..."
                                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                              />
                              <button
                                onClick={() => handleApprove(rec.id)}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
                              >
                                Sign & Lock Period
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setApprovingId(rec.id)}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex items-center gap-1.5"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              Approve & Lock Period
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
