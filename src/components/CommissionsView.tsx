import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CommissionRule, Provider, TransactionType } from '../types';
import { formatUGX } from '../utils/formatters';
import { OFFICIAL_TARIFF_SOURCES } from '../data/officialTariffs';
import {
  Percent,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Calculator,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Info,
  Scale,
  ShieldCheck,
} from 'lucide-react';

export const CommissionsView: React.FC = () => {
  const {
    commissionRules,
    calculateCommission,
    getTariffBreakdown,
    saveCommissionRule,
    deleteCommissionRule,
    resetToOfficialTariffs,
    transactions,
    currentUser,
  } = useApp();

  const [activeProvider, setActiveProvider] = useState<Provider>('MTN');
  const [activeType, setActiveType] = useState<TransactionType>('WITHDRAWAL');

  // Simulator state
  const [simAmount, setSimAmount] = useState<string>('150000');
  const [simType, setSimType] = useState<TransactionType>('WITHDRAWAL');

  // Rule edit modal state
  const [editingRule, setEditingRule] = useState<CommissionRule | null>(null);
  const [isNewRule, setIsNewRule] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const parsedSimAmount = parseInt(simAmount.replace(/[^0-9]/g, ''), 10) || 0;

  // Compute breakdowns for both MTN and Airtel for side-by-side comparison
  const mtnBreakdown = getTariffBreakdown('MTN', simType, parsedSimAmount);
  const airtelBreakdown = getTariffBreakdown('AIRTEL', simType, parsedSimAmount);

  // Filter rules for active tab
  const currentRules = commissionRules
    .filter((r) => r.provider === activeProvider && r.transactionType === activeType)
    .sort((a, b) => a.minAmount - b.minAmount);

  // Earnings by provider
  const mtnEarnings = transactions
    .filter((t) => t.status === 'COMPLETED' && t.provider === 'MTN')
    .reduce((sum, t) => sum + t.commission, 0);

  const airtelEarnings = transactions
    .filter((t) => t.status === 'COMPLETED' && t.provider === 'AIRTEL')
    .reduce((sum, t) => sum + t.commission, 0);

  const handleOpenNewRule = () => {
    setIsNewRule(true);
    setEditingRule({
      id: `cr-${Date.now()}`,
      provider: activeProvider,
      transactionType: activeType,
      minAmount: 100000,
      maxAmount: 500000,
      commissionType: 'FIXED',
      commissionValue: 1200,
      customerFee: activeType === 'WITHDRAWAL' ? 3575 : 0,
      govtTaxRate: activeType === 'WITHDRAWAL' ? 0.005 : 0,
      description: `${activeProvider} ${activeType} Custom Tier`,
    });
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    saveCommissionRule(editingRule);
    setEditingRule(null);
    setIsNewRule(false);
  };

  const handleExecuteReset = () => {
    resetToOfficialTariffs();
    setConfirmReset(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              Official Uganda Telecom Tariffs Applied
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              0.5% Gov Mobile Money Excise Duty Compliant
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Official Tariffs & Commission Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Live tariffs synced from official MTN Uganda & Airtel Uganda tariff guides with customer fees, government
            taxes, and agent commission margins.
          </p>

          {/* Official Source Links */}
          <div className="flex flex-wrap items-center gap-3 mt-3 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-semibold text-[11px]">Official Sources:</span>
            <a
              href="https://www.mtn.co.ug/tariffs/mobile-money-tariffs/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-yellow-700 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 px-2.5 py-1 rounded-lg transition-colors"
            >
              <span>MTN Uganda MoMo Tariffs</span>
              <ExternalLink className="w-3 h-3 text-yellow-600" />
            </a>
            <a
              href="https://www.airtel.co.ug/airtelmoney/transaction_fees"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-colors"
            >
              <span>Airtel Uganda Transaction Fees</span>
              <ExternalLink className="w-3 h-3 text-red-600" />
            </a>
          </div>
        </div>

        {currentUser.role !== 'AGENT' && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setConfirmReset(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Reset all rules to official MTN & Airtel tariffs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Official Tariffs
            </button>
            <button
              onClick={handleOpenNewRule}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Custom Tier
            </button>
          </div>
        )}
      </div>

      {/* Side-By-Side MTN vs Airtel Tariff & Commission Simulator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Interactive Tariff & Commission Calculator
              </h3>
              <p className="text-xs text-slate-500">
                Compare customer fees, 0.5% government tax, and agent commission side-by-side
              </p>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Presets:</span>
            {[5000, 20000, 50000, 100000, 200000, 500000, 1000000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setSimAmount(preset.toLocaleString('en-US'))}
                className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                {preset >= 1000000 ? `${preset / 1000000}M` : `${preset / 1000}K`}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Transaction Service Point
            </label>
            <select
              value={simType}
              onChange={(e) => setSimType(e.target.value as TransactionType)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="WITHDRAWAL">Cash Out (Agent Withdrawal)</option>
              <option value="DEPOSIT">Cash In (Free Customer Deposit)</option>
              <option value="AIRTIME">Load Airtime (4% Agent Commission)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Transaction Amount (UGX)
            </label>
            <input
              type="text"
              value={simAmount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setSimAmount(val ? parseInt(val, 10).toLocaleString('en-US') : '');
              }}
              placeholder="150,000"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="flex items-end">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 w-full text-xs text-slate-600">
              <span className="font-semibold block text-[11px] text-slate-500">Government Tax Note:</span>
              <span>
                {simType === 'WITHDRAWAL'
                  ? '0.5% excise duty applies to customer withdrawal amount automatically.'
                  : 'Cash deposits & airtime purchases are 100% tax-free to the customer.'}
              </span>
            </div>
          </div>
        </div>

        {/* Comparison Cards: MTN vs Airtel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
          {/* MTN MoMo Card */}
          <div className="p-5 rounded-2xl border-2 border-yellow-300 bg-yellow-50/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center">
                  M
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">MTN Uganda Mobile Money</h4>
                  <a
                    href="https://www.mtn.co.ug/tariffs/mobile-money-tariffs/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-yellow-800 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>mtn.co.ug/tariffs</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-yellow-200/70 text-yellow-900">
                Official Tier
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-yellow-200/60 font-sans">
                <span className="text-slate-600">Principal Amount:</span>
                <span className="font-bold text-slate-900 font-mono">{formatUGX(parsedSimAmount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-yellow-200/60 font-sans">
                <span className="text-slate-600">Customer Network Fee:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {mtnBreakdown.customerFee === 0 ? 'FREE (0 UGX)' : formatUGX(mtnBreakdown.customerFee)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-yellow-200/60 font-sans">
                <span className="text-slate-600">0.5% Uganda Gov Excise Duty:</span>
                <span className="font-bold text-amber-800 font-mono">
                  {mtnBreakdown.govtTax === 0 ? '0 UGX (Exempt)' : formatUGX(mtnBreakdown.govtTax)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-yellow-300 font-sans">
                <span className="font-bold text-slate-900">Total Customer Wallet Debit:</span>
                <span className="font-extrabold text-slate-900 font-mono">
                  {formatUGX(mtnBreakdown.totalCustomerCost)}
                </span>
              </div>
            </div>

            {/* Agent Commission Box */}
            <div className="p-3 bg-white rounded-xl border border-yellow-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block font-sans">
                  Agent Net Commission
                </span>
                <span className="text-lg font-black text-emerald-700 font-mono">
                  {formatUGX(mtnBreakdown.agentCommission)}
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                {parsedSimAmount > 0
                  ? `${((mtnBreakdown.agentCommission / parsedSimAmount) * 100).toFixed(2)}% margin`
                  : '0.00%'}
              </span>
            </div>
          </div>

          {/* Airtel Money Card */}
          <div className="p-5 rounded-2xl border-2 border-red-300 bg-red-50/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">
                  A
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Airtel Uganda Money</h4>
                  <a
                    href="https://www.airtel.co.ug/airtelmoney/transaction_fees"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-red-800 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>airtel.co.ug/transaction_fees</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-200/70 text-red-900">
                Official Tier
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-red-200/60 font-sans">
                <span className="text-slate-600">Principal Amount:</span>
                <span className="font-bold text-slate-900 font-mono">{formatUGX(parsedSimAmount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-red-200/60 font-sans">
                <span className="text-slate-600">Customer Network Fee:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {airtelBreakdown.customerFee === 0 ? 'FREE (0 UGX)' : formatUGX(airtelBreakdown.customerFee)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-red-200/60 font-sans">
                <span className="text-slate-600">0.5% Uganda Gov Excise Duty:</span>
                <span className="font-bold text-amber-800 font-mono">
                  {airtelBreakdown.govtTax === 0 ? '0 UGX (Exempt)' : formatUGX(airtelBreakdown.govtTax)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-red-300 font-sans">
                <span className="font-bold text-slate-900">Total Customer Wallet Debit:</span>
                <span className="font-extrabold text-slate-900 font-mono">
                  {formatUGX(airtelBreakdown.totalCustomerCost)}
                </span>
              </div>
            </div>

            {/* Agent Commission Box */}
            <div className="p-3 bg-white rounded-xl border border-red-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block font-sans">
                  Agent Net Commission
                </span>
                <span className="text-lg font-black text-emerald-700 font-mono">
                  {formatUGX(airtelBreakdown.agentCommission)}
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                {parsedSimAmount > 0
                  ? `${((airtelBreakdown.agentCommission / parsedSimAmount) * 100).toFixed(2)}% margin`
                  : '0.00%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Selector Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveProvider('MTN')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeProvider === 'MTN'
                  ? 'bg-yellow-400 text-slate-950 shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              MTN Mobile Money
            </button>
            <button
              onClick={() => setActiveProvider('AIRTEL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeProvider === 'AIRTEL'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
              Airtel Money
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveType('WITHDRAWAL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeType === 'WITHDRAWAL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Withdrawals (Cash Out)
            </button>
            <button
              onClick={() => setActiveType('DEPOSIT')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeType === 'DEPOSIT'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Deposits (Cash In)
            </button>
            <button
              onClick={() => setActiveType('AIRTIME')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeType === 'AIRTIME'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Load Airtime (4%)
            </button>
          </div>
        </div>

        {/* Tiers Table with Customer Fee & 0.5% Tax breakdown */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Band Min (UGX)</th>
                <th className="py-3 px-4">Band Max (UGX)</th>
                <th className="py-3 px-4">Customer Fee</th>
                <th className="py-3 px-4">Gov Excise (0.5%)</th>
                <th className="py-3 px-4 text-right">Agent Commission</th>
                <th className="py-3 px-4 text-center">Type</th>
                <th className="py-3 px-4">Tier Description</th>
                {currentUser.role !== 'AGENT' && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {currentRules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                    No tiers configured for this provider and transaction type.
                  </td>
                </tr>
              ) : (
                currentRules.map((rule) => {
                  const custFee = rule.customerFee ?? (rule.transactionType === 'WITHDRAWAL' ? 330 : 0);
                  const isExempt = rule.transactionType !== 'WITHDRAWAL';
                  return (
                    <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{formatUGX(rule.minAmount)}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{formatUGX(rule.maxAmount)}</td>
                      <td className="py-3 px-4 font-sans text-slate-700">
                        {custFee === 0 ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            FREE (0 UGX)
                          </span>
                        ) : (
                          <span className="font-mono font-semibold">{formatUGX(custFee)}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600">
                        {isExempt ? (
                          <span className="text-[10px] text-slate-400">Exempt</span>
                        ) : (
                          <span className="font-mono text-amber-700 font-semibold">+ 0.5% amount</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-700 font-mono">
                        {rule.commissionType === 'FIXED'
                          ? formatUGX(rule.commissionValue)
                          : `${rule.commissionValue}%`}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {rule.commissionType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600 truncate max-w-[200px]">
                        {rule.description}
                      </td>
                      {currentUser.role !== 'AGENT' && (
                        <td className="py-3 px-4 text-right font-sans">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setIsNewRule(false);
                                setEditingRule(rule);
                              }}
                              className="p-1 rounded hover:bg-slate-100 text-slate-600"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this commission tier?')) {
                                  deleteCommissionRule(rule.id);
                                }
                              }}
                              className="p-1 rounded hover:bg-rose-100 text-rose-600"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Reset Modal */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Reset to Official Uganda Tariffs?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will overwrite any custom tiers with the official rates from{' '}
                <span className="font-semibold text-slate-800">mtn.co.ug/tariffs</span> and{' '}
                <span className="font-semibold text-slate-800">airtel.co.ug/transaction_fees</span>, including all 14
                withdrawal tiers and 6 deposit tiers per provider.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Yes, Reset All Tariffs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Rule Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              {isNewRule ? 'Add New Commission Tier' : 'Edit Commission Tier'}
            </h3>

            <form onSubmit={handleSaveRule} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Provider</label>
                  <select
                    value={editingRule.provider}
                    onChange={(e) => setEditingRule({ ...editingRule, provider: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border rounded-lg font-semibold"
                  >
                    <option value="MTN">MTN</option>
                    <option value="AIRTEL">Airtel</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Type</label>
                  <select
                    value={editingRule.transactionType}
                    onChange={(e) => setEditingRule({ ...editingRule, transactionType: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border rounded-lg font-semibold"
                  >
                    <option value="WITHDRAWAL">Withdrawal (Cash Out)</option>
                    <option value="DEPOSIT">Deposit (Cash In)</option>
                    <option value="AIRTIME">Airtime Recharge</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Min Amount (UGX)</label>
                  <input
                    type="number"
                    value={editingRule.minAmount}
                    onChange={(e) => setEditingRule({ ...editingRule, minAmount: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border rounded-lg font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Max Amount (UGX)</label>
                  <input
                    type="number"
                    value={editingRule.maxAmount}
                    onChange={(e) => setEditingRule({ ...editingRule, maxAmount: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border rounded-lg font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Customer Fee (UGX)</label>
                  <input
                    type="number"
                    value={editingRule.customerFee ?? 0}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, customerFee: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-2.5 py-1.5 bg-slate-50 border rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Gov Tax Rate (e.g. 0.005)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={editingRule.govtTaxRate ?? 0.005}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, govtTaxRate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-2.5 py-1.5 bg-slate-50 border rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Commission Type</label>
                  <select
                    value={editingRule.commissionType}
                    onChange={(e) => setEditingRule({ ...editingRule, commissionType: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border rounded-lg font-semibold"
                  >
                    <option value="FIXED">Fixed (UGX)</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Commission Value</label>
                  <input
                    type="number"
                    value={editingRule.commissionValue}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, commissionValue: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-2.5 py-1.5 bg-slate-50 border rounded-lg font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Tier Description</label>
                <input
                  type="text"
                  value={editingRule.description}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border rounded-lg"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Save Tier Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
