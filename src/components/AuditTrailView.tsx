import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDateTime } from '../utils/formatters';
import { ShieldCheck, Search, Filter, Lock, History } from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const { auditLogs } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    if (entityFilter !== 'ALL' && log.entityType !== entityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAction = log.action.toLowerCase().includes(q);
      const matchUser = log.userName.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      return matchAction || matchUser || matchDetails;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              Immutable Governance
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Compliance & Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cryptographically sealed chronological log of all cash movements, float adjustments, and reversals.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>Append-Only Immutable Storage</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by user, action, or details..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
        >
          <option value="ALL">All Event Types</option>
          <option value="TRANSACTION">Transactions</option>
          <option value="WALLET">Wallets / Balances</option>
          <option value="FLOAT_TRANSFER">Float Transfers</option>
          <option value="RECONCILIATION">Reconciliations</option>
          <option value="EXPENSE">Expenses</option>
          <option value="COMMISSION_RULE">Commission Rules</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Timestamp (WHEN)</th>
                <th className="py-3 px-4">Actor (WHO)</th>
                <th className="py-3 px-4">Event Action (WHAT)</th>
                <th className="py-3 px-4">Entity Type (WHERE)</th>
                <th className="py-3 px-4">Audit Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No audit records matching query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900 block">{log.userName}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{log.userRole}</span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-800 text-[11px] whitespace-nowrap">
                      {log.action}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {log.entityType}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      <p className="max-w-md">{log.details}</p>
                      {log.oldValues && (
                        <div className="mt-1 p-1.5 bg-slate-50 rounded text-[10px] font-mono text-slate-500">
                          <strong>Before:</strong> {JSON.stringify(log.oldValues)}
                        </div>
                      )}
                      {log.newValues && (
                        <div className="mt-1 p-1.5 bg-slate-50 rounded text-[10px] font-mono text-slate-600">
                          <strong>After:</strong> {JSON.stringify(log.newValues)}
                        </div>
                      )}
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
