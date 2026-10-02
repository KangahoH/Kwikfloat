import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Provider, TransactionType, Transaction } from '../types';
import { formatUGX, detectProviderFromPhone } from '../utils/formatters';
import { parseMobileMoneySMS, SAMPLE_SMS_MESSAGES } from '../utils/smsParser';
import { X, Smartphone, ArrowDownRight, ArrowUpRight, CheckCircle2, AlertTriangle, FileText, Sparkles, Radio } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTransactionSuccess?: (tx: Transaction) => void;
  initialType?: TransactionType;
}

export const NewTransactionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onTransactionSuccess,
  initialType = 'WITHDRAWAL',
}) => {
  const { recordTransaction, calculateCommission, getTariffBreakdown, wallets, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'MANUAL' | 'SMS_PARSE'>('MANUAL');
  const [provider, setProvider] = useState<Provider>('MTN');
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('100000');
  const [phone, setPhone] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [rawSMS, setRawSMS] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-detect provider when user types phone
  useEffect(() => {
    if (phone.length >= 3) {
      const detected = detectProviderFromPhone(phone);
      if (detected) {
        setProvider(detected);
      }
    }
  }, [phone]);

  if (!isOpen) return null;

  const parsedAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;
  const tariff = getTariffBreakdown(provider, type, parsedAmount);
  const calculatedComm = tariff.agentCommission;

  // Find relevant branch wallets
  const branchCash = wallets.find((w) => w.branchId === currentUser.branchId && w.walletType === 'CASH') || wallets[0];
  const branchFloat =
    wallets.find(
      (w) => w.branchId === currentUser.branchId && w.walletType === (provider === 'MTN' ? 'MTN_FLOAT' : 'AIRTEL_FLOAT')
    ) || wallets.find((w) => w.walletType === (provider === 'MTN' ? 'MTN_FLOAT' : 'AIRTEL_FLOAT'))!;

  const handleSMSParse = (smsText: string) => {
    setRawSMS(smsText);
    const res = parseMobileMoneySMS(smsText);
    if (res.success) {
      if (res.provider) setProvider(res.provider);
      if (res.type) setType(res.type);
      if (res.amount) setAmount(res.amount.toString());
      if (res.phone) setPhone(res.phone);
      if (res.customerName) setCustomerName(res.customerName);
      setError(null);
    } else {
      setError(res.error || 'Unable to parse SMS');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (parsedAmount <= 0) {
      setError('Please enter a valid transaction amount');
      return;
    }

    if (!phone || phone.replace(/[^0-9]/g, '').length < 9) {
      setError('Please enter a valid 10-digit Ugandan phone number (e.g., 0772 123 456)');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = recordTransaction({
        provider,
        type,
        amount: parsedAmount,
        customerPhone: phone,
        customerName: customerName.trim() || undefined,
        notes: notes.trim() || undefined,
        smsRawText: activeTab === 'SMS_PARSE' ? rawSMS : undefined,
      });

      if (!res.success) {
        setError(res.error || 'Failed to record transaction');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      if (res.transaction && onTransactionSuccess) {
        onTransactionSuccess(res.transaction);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error executing ledger update');
      setIsSubmitting(false);
    }
  };

  const quickAmounts =
    type === 'AIRTIME'
      ? [1000, 2000, 5000, 10000, 20000, 50000, 100000]
      : [10000, 20000, 50000, 100000, 200000, 500000, 1000000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
              UG
            </div>
            <div>
              <h2 className="text-lg font-bold">Record Mobile Money Transaction</h2>
              <p className="text-xs text-slate-400">
                Agent: <span className="text-white font-medium">{currentUser.name}</span> • {currentUser.branchName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: Manual vs SMS Paste */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('MANUAL')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'MANUAL'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Direct Register Entry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SMS_PARSE')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'SMS_PARSE'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Fast SMS Ingestion
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'SMS_PARSE' && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                  Paste MoMo / Airtel Confirmation SMS
                </span>
                <span className="text-[11px] text-amber-700">Auto-extracts amount, phone & ref</span>
              </div>
              <textarea
                value={rawSMS}
                onChange={(e) => handleSMSParse(e.target.value)}
                placeholder="Paste transaction SMS here (e.g. Y'ello. UGX 200,000 sent to 256772... Trans ID: 918239...)"
                rows={3}
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-slate-500">Sample test messages:</span>
                {SAMPLE_SMS_MESSAGES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSMSParse(sample.sms)}
                    className="text-[10px] bg-white hover:bg-amber-100 text-slate-700 px-2 py-1 rounded border border-amber-200 transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Provider Selection (MTN vs Airtel) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Mobile Money Provider
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProvider('MTN')}
                className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
                  provider === 'MTN'
                    ? 'border-yellow-500 bg-yellow-50/70 ring-2 ring-yellow-400/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-yellow-400 text-black font-extrabold text-xs flex items-center justify-center shadow-xs">
                    M
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900 text-sm">MTN MoMo</p>
                    <p className="text-[11px] text-slate-500">077, 078, 076</p>
                  </div>
                </div>
                {provider === 'MTN' && <CheckCircle2 className="w-5 h-5 text-yellow-600" />}
              </button>

              <button
                type="button"
                onClick={() => setProvider('AIRTEL')}
                className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
                  provider === 'AIRTEL'
                    ? 'border-red-500 bg-red-50/70 ring-2 ring-red-400/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-red-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                    A
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900 text-sm">Airtel Money</p>
                    <p className="text-[11px] text-slate-500">070, 075, 074</p>
                  </div>
                </div>
                {provider === 'AIRTEL' && <CheckCircle2 className="w-5 h-5 text-red-600" />}
              </button>
            </div>
          </div>

          {/* Transaction Type Selection: Cash Out vs Cash In vs Load Airtime */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Transaction Service Point
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setType('WITHDRAWAL')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  type === 'WITHDRAWAL'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <ArrowDownRight className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    Cash Out
                  </span>
                  {type === 'WITHDRAWAL' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-[10px] text-slate-500">Customer withdraws cash</p>
              </button>

              <button
                type="button"
                onClick={() => setType('DEPOSIT')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  type === 'DEPOSIT'
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <ArrowUpRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    Cash In
                  </span>
                  {type === 'DEPOSIT' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-[10px] text-slate-500">Customer sends cash</p>
              </button>

              <button
                type="button"
                onClick={() => setType('AIRTIME')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  type === 'AIRTIME'
                    ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    Load Airtime
                  </span>
                  {type === 'AIRTIME' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                </div>
                <p className="text-[10px] text-slate-500">Recharge airtime (4% comm)</p>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Amount (UGX)</label>
              <span className="text-xs font-semibold text-emerald-700">
                Commission: {formatUGX(calculatedComm)}
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                UGX
              </div>
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setAmount(val ? parseInt(val, 10).toLocaleString('en-US') : '');
                }}
                placeholder="100,000"
                className="w-full pl-14 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-lg font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q.toLocaleString('en-US'))}
                  className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  {q >= 1000000 ? `${q / 1000000}M` : `${q / 1000}K`}
                </button>
              ))}
            </div>

            {/* Official Tariff & Commission Preview Card */}
            {parsedAmount > 0 && (
              <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 border-b border-slate-200 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        provider === 'MTN' ? 'bg-yellow-400' : 'bg-red-600'
                      }`}
                    />
                    Official {provider} Tariff Breakdown
                  </span>
                  <span className="text-emerald-700 font-mono font-extrabold">
                    Agent Earns: {formatUGX(tariff.agentCommission)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Customer Fee</span>
                    <span className="font-mono font-bold text-slate-800">
                      {tariff.customerFee === 0 ? 'FREE (0 UGX)' : formatUGX(tariff.customerFee)}
                    </span>
                  </div>
                  <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">0.5% Gov Tax</span>
                    <span className="font-mono font-bold text-amber-700">
                      {tariff.govtTax === 0 ? 'Exempt' : formatUGX(tariff.govtTax)}
                    </span>
                  </div>
                  <div className="p-1.5 bg-white rounded-lg border border-slate-200 sm:col-span-2">
                    <span className="text-slate-400 block text-[10px]">
                      {type === 'WITHDRAWAL' ? 'Total Customer Account Debit' : 'Total Cash Exchanged'}
                    </span>
                    <span className="font-mono font-extrabold text-slate-900">
                      {formatUGX(tariff.totalCustomerCost)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Customer Phone & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Customer Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0772 123 456"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Customer Name <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Kato David"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reference / Note <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. School fees, Landlord rent payment"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {/* Double-Entry Ledger Impact Box */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-700 mb-1">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Double-Entry Ledger Impact
              </span>
              <span className="font-mono text-indigo-600">Auto-balanced</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">{provider} Float ({branchFloat?.accountName})</span>
                <span className={type === 'DEPOSIT' ? 'text-blue-600 font-bold' : 'text-rose-600 font-bold'}>
                  {type === 'DEPOSIT' ? `+ ${formatUGX(parsedAmount)}` : `- ${formatUGX(parsedAmount)}`}
                </span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Cash Drawer ({branchCash?.accountName})</span>
                <span className={type === 'DEPOSIT' ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                  {type === 'DEPOSIT' ? `- ${formatUGX(parsedAmount)}` : `+ ${formatUGX(parsedAmount)}`}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || parsedAmount <= 0}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition-all flex items-center gap-2 ${
                provider === 'MTN'
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-slate-950 ring-1 ring-yellow-600/30'
                  : 'bg-red-600 hover:bg-red-700 text-white ring-1 ring-red-700/30'
              } disabled:opacity-50`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting
                ? 'Recording...'
                : type === 'AIRTIME'
                ? `Load ${provider} Airtime`
                : `Record ${provider} ${type === 'DEPOSIT' ? 'Cash In' : 'Cash Out'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
