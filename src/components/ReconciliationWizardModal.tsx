import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatUGX } from '../utils/formatters';
import {
  X,
  Scale,
  CheckCircle,
  AlertTriangle,
  Coins,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  FileCheck2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ReconciliationWizardModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    wallets,
    transactions,
    expenses,
    transfers,
    currentUser,
    branches,
    submitReconciliation,
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: MTN, 2: Airtel, 3: Cash, 4: Review & Submit
  const [selectedBranchId, setSelectedBranchId] = useState<string>(currentUser.branchId || branches[0].id);
  const [reconDate, setReconDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const branch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  // Active wallets for this branch
  const mtnWallet =
    wallets.find((w) => w.branchId === selectedBranchId && w.walletType === 'MTN_FLOAT') ||
    wallets.find((w) => w.walletType === 'MTN_FLOAT')!;
  const airtelWallet =
    wallets.find((w) => w.branchId === selectedBranchId && w.walletType === 'AIRTEL_FLOAT') ||
    wallets.find((w) => w.walletType === 'AIRTEL_FLOAT')!;
  const cashWallet =
    wallets.find((w) => w.branchId === selectedBranchId && w.walletType === 'CASH') ||
    wallets.find((w) => w.walletType === 'CASH')!;

  // Transactions for today & branch
  const branchTxs = useMemo(() => {
    return transactions.filter(
      (t) =>
        t.status === 'COMPLETED' &&
        t.branchId === selectedBranchId &&
        t.transactionDate.startsWith(reconDate)
    );
  }, [transactions, selectedBranchId, reconDate]);

  // MTN calculations
  const mtnOpening = mtnWallet?.openingBalance || 5000000;
  const mtnDeposits = branchTxs
    .filter((t) => t.provider === 'MTN' && t.type === 'DEPOSIT')
    .reduce((sum, t) => sum + t.amount, 0);
  const mtnWithdrawals = branchTxs
    .filter((t) => t.provider === 'MTN' && t.type === 'WITHDRAWAL')
    .reduce((sum, t) => sum + t.amount, 0);
  const mtnAirtime = branchTxs
    .filter((t) => t.provider === 'MTN' && t.type === 'AIRTIME')
    .reduce((sum, t) => sum + t.amount, 0);

  // Transfers affecting MTN
  const mtnTransfersIn = transfers
    .filter((tr) => tr.destinationWalletId === mtnWallet?.id && tr.createdAt.startsWith(reconDate))
    .reduce((sum, tr) => sum + tr.amount, 0);
  const mtnTransfersOut = transfers
    .filter((tr) => tr.sourceWalletId === mtnWallet?.id && tr.createdAt.startsWith(reconDate))
    .reduce((sum, tr) => sum + tr.amount, 0);
  const mtnTransfers = mtnTransfersIn - mtnTransfersOut;

  // PRD formula: Expected MTN = Opening + Deposits - Withdrawals - Airtime Loaded + Transfers
  const mtnExpected = mtnOpening + mtnDeposits - mtnWithdrawals - mtnAirtime + mtnTransfers;
  const [mtnActual, setMtnActual] = useState<string>(mtnExpected.toString());
  const [mtnReason, setMtnReason] = useState<string>('');
  const parsedMtnActual = parseInt(mtnActual.replace(/[^0-9]/g, ''), 10) || 0;
  const mtnVariance = parsedMtnActual - mtnExpected;

  // Airtel calculations
  const airtelOpening = airtelWallet?.openingBalance || 4000000;
  const airtelDeposits = branchTxs
    .filter((t) => t.provider === 'AIRTEL' && t.type === 'DEPOSIT')
    .reduce((sum, t) => sum + t.amount, 0);
  const airtelWithdrawals = branchTxs
    .filter((t) => t.provider === 'AIRTEL' && t.type === 'WITHDRAWAL')
    .reduce((sum, t) => sum + t.amount, 0);
  const airtelAirtime = branchTxs
    .filter((t) => t.provider === 'AIRTEL' && t.type === 'AIRTIME')
    .reduce((sum, t) => sum + t.amount, 0);

  const airtelTransfersIn = transfers
    .filter((tr) => tr.destinationWalletId === airtelWallet?.id && tr.createdAt.startsWith(reconDate))
    .reduce((sum, tr) => sum + tr.amount, 0);
  const airtelTransfersOut = transfers
    .filter((tr) => tr.sourceWalletId === airtelWallet?.id && tr.createdAt.startsWith(reconDate))
    .reduce((sum, tr) => sum + tr.amount, 0);
  const airtelTransfers = airtelTransfersIn - airtelTransfersOut;

  const airtelExpected = airtelOpening + airtelDeposits - airtelWithdrawals - airtelAirtime + airtelTransfers;
  const [airtelActual, setAirtelActual] = useState<string>(airtelExpected.toString());
  const [airtelReason, setAirtelReason] = useState<string>('');
  const parsedAirtelActual = parseInt(airtelActual.replace(/[^0-9]/g, ''), 10) || 0;
  const airtelVariance = parsedAirtelActual - airtelExpected;

  // Cash calculations
  // PRD formula Section 6: Starting Cash + Withdrawals + Airtime Cash Inflow - Deposits - Expenses + Transfers
  const cashOpening = cashWallet?.openingBalance || 2000000;
  const cashWithdrawalsIn = branchTxs
    .filter((t) => t.type === 'WITHDRAWAL')
    .reduce((sum, t) => sum + t.amount, 0);
  const cashAirtimeIn = branchTxs
    .filter((t) => t.type === 'AIRTIME')
    .reduce((sum, t) => sum + t.amount, 0);
  const cashDepositsOut = branchTxs
    .filter((t) => t.type === 'DEPOSIT')
    .reduce((sum, t) => sum + t.amount, 0);

  const branchExpenses = expenses
    .filter((e) => e.paymentWalletId === cashWallet?.id && e.expenseDate === reconDate)
    .reduce((sum, e) => sum + e.amount, 0);

  const cashTransfersIn = transfers
    .filter((tr) => tr.destinationWalletId === cashWallet?.id && tr.createdAt.startsWith(reconDate))
    .reduce((sum, tr) => sum + tr.amount, 0);
  const cashTransfersOut = transfers
    .filter((tr) => tr.sourceWalletId === cashWallet?.id && tr.createdAt.startsWith(reconDate))
    .reduce((sum, tr) => sum + tr.amount, 0);
  const cashTransfers = cashTransfersIn - cashTransfersOut;

  const cashExpected =
    cashOpening + cashWithdrawalsIn + cashAirtimeIn - cashDepositsOut - branchExpenses + cashTransfers;

  // Cash Denominations
  const [denominations, setDenominations] = useState({
    c50000: Math.floor(cashExpected / 100000), // prefill roughly for convenience
    c20000: 5,
    c10000: 5,
    c5000: 4,
    c2000: 5,
    c1000: 10,
    c500: 10,
    c200: 0,
    c100: 0,
  });

  const countedCash =
    denominations.c50000 * 50000 +
    denominations.c20000 * 20000 +
    denominations.c10000 * 10000 +
    denominations.c5000 * 5000 +
    denominations.c2000 * 2000 +
    denominations.c1000 * 1000 +
    denominations.c500 * 500 +
    denominations.c200 * 200 +
    denominations.c100 * 100;

  const [useDenominationCounter, setUseDenominationCounter] = useState(true);
  const [manualCashActual, setManualCashActual] = useState(cashExpected.toString());
  const [cashReason, setCashReason] = useState<string>('');

  const parsedCashActual = useDenominationCounter
    ? countedCash
    : parseInt(manualCashActual.replace(/[^0-9]/g, ''), 10) || 0;
  const cashVariance = parsedCashActual - cashExpected;

  const isOverallBalanced = mtnVariance === 0 && airtelVariance === 0 && cashVariance === 0;

  const handleDenomChange = (key: keyof typeof denominations, val: string) => {
    const count = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
    setDenominations((prev) => ({ ...prev, [key]: count }));
  };

  const handleFinalSubmit = () => {
    submitReconciliation({
      date: reconDate,
      branchId: branch.id,
      branchName: branch.name,
      agentId: currentUser.id,
      agentName: currentUser.name,
      // MTN
      mtnOpening,
      mtnDeposits,
      mtnWithdrawals,
      mtnTransfers,
      mtnExpected,
      mtnActual: parsedMtnActual,
      mtnVariance,
      mtnVarianceReason: mtnReason.trim() || undefined,
      // Airtel
      airtelOpening,
      airtelDeposits,
      airtelWithdrawals,
      airtelTransfers,
      airtelExpected,
      airtelActual: parsedAirtelActual,
      airtelVariance,
      airtelVarianceReason: airtelReason.trim() || undefined,
      // Cash
      cashOpening,
      cashWithdrawals: cashWithdrawalsIn,
      cashDeposits: cashDepositsOut,
      cashExpenses: branchExpenses,
      cashTransfers,
      cashExpected,
      cashActual: parsedCashActual,
      cashVariance,
      cashVarianceReason: cashReason.trim() || undefined,
      cashDenominations: denominations,
      status: isOverallBalanced ? 'BALANCED' : 'VARIANCE_PENDING',
      reconciledBy: currentUser.name,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Daily End-Of-Day (EOD) Reconciliation</h2>
              <p className="text-xs text-slate-400">
                Verify physical cash and electronic SIM float balances against double-entry ledger
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

        {/* Wizard Step Bar */}
        <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setStep(1)}
            className={`py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              step === 1 ? 'border-yellow-500 text-yellow-700 bg-yellow-50/50' : 'border-transparent text-slate-500'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-yellow-400 text-black text-[11px] font-bold flex items-center justify-center">
              1
            </span>
            <span>MTN Float</span>
          </button>

          <button
            onClick={() => setStep(2)}
            className={`py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              step === 2 ? 'border-red-500 text-red-700 bg-red-50/50' : 'border-transparent text-slate-500'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center">
              2
            </span>
            <span>Airtel Float</span>
          </button>

          <button
            onClick={() => setStep(3)}
            className={`py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              step === 3 ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50' : 'border-transparent text-slate-500'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
              3
            </span>
            <span>Cash Drawer</span>
          </button>

          <button
            onClick={() => setStep(4)}
            className={`py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              step === 4 ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-slate-500'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
              4
            </span>
            <span>Review & Lock</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Top metadata selector */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">Branch:</span>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-semibold text-slate-800"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">Reconciliation Date:</span>
              <input
                type="date"
                value={reconDate}
                onChange={(e) => setReconDate(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-mono text-slate-800"
              />
            </div>
          </div>

          {/* Step 1: MTN Float Reconciliation */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-yellow-400 text-black font-extrabold flex items-center justify-center text-sm">
                    M
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">MTN Float Ledger vs Phone SIM (*165#)</h3>
                    <p className="text-xs text-slate-500">{mtnWallet?.accountName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Status</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      mtnVariance === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {mtnVariance === 0 ? 'Balanced' : `Variance: ${formatUGX(mtnVariance)}`}
                  </span>
                </div>
              </div>

              {/* Math breakdown matching PRD Section 11 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Opening Float Balance:</span>
                  <span className="font-bold text-slate-800">{formatUGX(mtnOpening)}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>+ Customer Cash In (Deposits):</span>
                  <span>+{formatUGX(mtnDeposits)}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>- Customer Cash Out (Withdrawals):</span>
                  <span>-{formatUGX(mtnWithdrawals)}</span>
                </div>
                {mtnAirtime > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>- Airtime Sales Loaded:</span>
                    <span>-{formatUGX(mtnAirtime)}</span>
                  </div>
                )}
                {mtnTransfers !== 0 && (
                  <div className="flex justify-between text-indigo-600">
                    <span>+/- Float Transfers:</span>
                    <span>{mtnTransfers > 0 ? `+${formatUGX(mtnTransfers)}` : formatUGX(mtnTransfers)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-slate-900 text-sm">
                  <span>System Expected MTN Float:</span>
                  <span className="text-indigo-700">{formatUGX(mtnExpected)}</span>
                </div>
              </div>

              {/* User input actual phone float */}
              <div className="p-4 bg-yellow-50/50 rounded-xl border border-yellow-200 space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Actual MTN Float Balance on Agent Phone (*165#)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-mono font-bold text-slate-500">
                    UGX
                  </span>
                  <input
                    type="text"
                    value={mtnActual}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setMtnActual(val ? parseInt(val, 10).toLocaleString('en-US') : '');
                    }}
                    className="w-full pl-14 pr-4 py-2 bg-white border border-yellow-300 rounded-xl font-mono text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {mtnVariance !== 0 && (
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-semibold text-amber-900">
                      Variance Explanation ({formatUGX(mtnVariance)})
                    </label>
                    <input
                      type="text"
                      value={mtnReason}
                      onChange={(e) => setMtnReason(e.target.value)}
                      placeholder="e.g. MTN system charge 1,000 UGX deducted, or pending delayed MoMo notification"
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs"
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Airtel Float Reconciliation */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-extrabold flex items-center justify-center text-sm">
                    A
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Airtel Money Float vs Phone SIM (*185#)</h3>
                    <p className="text-xs text-slate-500">{airtelWallet?.accountName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Status</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      airtelVariance === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {airtelVariance === 0 ? 'Balanced' : `Variance: ${formatUGX(airtelVariance)}`}
                  </span>
                </div>
              </div>

              {/* Math breakdown */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Opening Airtel Float:</span>
                  <span className="font-bold text-slate-800">{formatUGX(airtelOpening)}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>+ Customer Cash In (Deposits):</span>
                  <span>+{formatUGX(airtelDeposits)}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>- Customer Cash Out (Withdrawals):</span>
                  <span>-{formatUGX(airtelWithdrawals)}</span>
                </div>
                {airtelAirtime > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>- Airtime Sales Loaded:</span>
                    <span>-{formatUGX(airtelAirtime)}</span>
                  </div>
                )}
                {airtelTransfers !== 0 && (
                  <div className="flex justify-between text-indigo-600">
                    <span>+/- Float Transfers:</span>
                    <span>{airtelTransfers > 0 ? `+${formatUGX(airtelTransfers)}` : formatUGX(airtelTransfers)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-slate-900 text-sm">
                  <span>System Expected Airtel Float:</span>
                  <span className="text-indigo-700">{formatUGX(airtelExpected)}</span>
                </div>
              </div>

              <div className="p-4 bg-red-50/50 rounded-xl border border-red-200 space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Actual Airtel Float on Agent Phone (*185#)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-mono font-bold text-slate-500">
                    UGX
                  </span>
                  <input
                    type="text"
                    value={airtelActual}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setAirtelActual(val ? parseInt(val, 10).toLocaleString('en-US') : '');
                    }}
                    className="w-full pl-14 pr-4 py-2 bg-white border border-red-300 rounded-xl font-mono text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {airtelVariance !== 0 && (
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-semibold text-rose-900">
                      Variance Explanation ({formatUGX(airtelVariance)})
                    </label>
                    <input
                      type="text"
                      value={airtelReason}
                      onChange={(e) => setAirtelReason(e.target.value)}
                      placeholder="e.g. Airtel USSD session fee or adjustment"
                      className="w-full px-3 py-2 bg-white border border-red-300 rounded-lg text-xs"
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Cash Drawer & Denomination Counter */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Physical Cash Drawer Count</h3>
                    <p className="text-xs text-slate-500">{cashWallet?.accountName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUseDenominationCounter(!useDenominationCounter)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 underline"
                  >
                    {useDenominationCounter ? 'Switch to Single Total' : 'Switch to Denomination Counter'}
                  </button>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      cashVariance === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {cashVariance === 0 ? 'Balanced' : `Variance: ${formatUGX(cashVariance)}`}
                  </span>
                </div>
              </div>

              {/* Math breakdown according to Section 6 of PRD */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Starting Physical Cash:</span>
                  <span className="font-bold text-slate-800">{formatUGX(cashOpening)}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>+ Customer Cash Out (Inflow):</span>
                  <span>+{formatUGX(cashWithdrawalsIn)}</span>
                </div>
                {cashAirtimeIn > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>+ Customer Airtime Cash (Inflow):</span>
                    <span>+{formatUGX(cashAirtimeIn)}</span>
                  </div>
                )}
                <div className="flex justify-between text-rose-600">
                  <span>- Customer Cash In (Outflow):</span>
                  <span>-{formatUGX(cashDepositsOut)}</span>
                </div>
                {branchExpenses > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>- Shop Expenses:</span>
                    <span>-{formatUGX(branchExpenses)}</span>
                  </div>
                )}
                {cashTransfers !== 0 && (
                  <div className="flex justify-between text-indigo-600">
                    <span>+/- Cash Transfers:</span>
                    <span>{cashTransfers > 0 ? `+${formatUGX(cashTransfers)}` : formatUGX(cashTransfers)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-slate-900 text-sm">
                  <span>System Expected Physical Cash:</span>
                  <span className="text-indigo-700">{formatUGX(cashExpected)}</span>
                </div>
              </div>

              {useDenominationCounter ? (
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Ugandan Banknotes & Coin Counter
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-800">
                      Total Counted: {formatUGX(countedCash)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      { key: 'c50000', label: '50,000 Note', multiplier: 50000 },
                      { key: 'c20000', label: '20,000 Note', multiplier: 20000 },
                      { key: 'c10000', label: '10,000 Note', multiplier: 10000 },
                      { key: 'c5000', label: '5,000 Note', multiplier: 5000 },
                      { key: 'c2000', label: '2,000 Note', multiplier: 2000 },
                      { key: 'c1000', label: '1,000 Note', multiplier: 1000 },
                      { key: 'c500', label: '500 Coin', multiplier: 500 },
                      { key: 'c200', label: '200 Coin', multiplier: 200 },
                      { key: 'c100', label: '100 Coin', multiplier: 100 },
                    ].map((d) => (
                      <div key={d.key} className="bg-white p-2 rounded-lg border border-emerald-200 flex items-center justify-between gap-1">
                        <div>
                          <span className="block font-medium text-slate-700 text-[11px]">{d.label}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatUGX((denominations as any)[d.key] * d.multiplier, false)}
                          </span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          value={(denominations as any)[d.key]}
                          onChange={(e) => handleDenomChange(d.key as any, e.target.value)}
                          className="w-14 py-1 px-1.5 text-center font-mono font-bold bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Actual Counted Cash (UGX)
                  </label>
                  <input
                    type="text"
                    value={manualCashActual}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setManualCashActual(val ? parseInt(val, 10).toLocaleString('en-US') : '');
                    }}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono text-base font-bold text-slate-900"
                  />
                </div>
              )}

              {cashVariance !== 0 && (
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-semibold text-amber-900">
                    Cash Variance Explanation ({formatUGX(cashVariance)})
                  </label>
                  <input
                    type="text"
                    value={cashReason}
                    onChange={(e) => setCashReason(e.target.value)}
                    placeholder="e.g. Cash drawer change shortage of 2,000 UGX, or unrecorded small coin fee"
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs"
                    required
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review & Lock Period */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">Reconciliation Summary Review</h3>
                  <p className="text-xs text-slate-400">
                    {branch.name} • {reconDate}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isOverallBalanced ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      100% Balanced
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Variance Recorded
                    </span>
                  )}
                </div>
              </div>

              {/* Grid of 3 registers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* MTN Card */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-yellow-50/30 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      MTN Float
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        mtnVariance === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {mtnVariance === 0 ? 'Balanced' : `${formatUGX(mtnVariance)}`}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Expected: {formatUGX(mtnExpected)}</p>
                  <p className="text-slate-900 font-bold text-sm">Actual: {formatUGX(parsedMtnActual)}</p>
                  {mtnReason && <p className="text-[10px] text-slate-500 italic">"{mtnReason}"</p>}
                </div>

                {/* Airtel Card */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-red-50/30 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                      Airtel Float
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        airtelVariance === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {airtelVariance === 0 ? 'Balanced' : `${formatUGX(airtelVariance)}`}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Expected: {formatUGX(airtelExpected)}</p>
                  <p className="text-slate-900 font-bold text-sm">Actual: {formatUGX(parsedAirtelActual)}</p>
                  {airtelReason && <p className="text-[10px] text-slate-500 italic">"{airtelReason}"</p>}
                </div>

                {/* Cash Card */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-emerald-50/30 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      Physical Cash
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        cashVariance === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {cashVariance === 0 ? 'Balanced' : `${formatUGX(cashVariance)}`}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Expected: {formatUGX(cashExpected)}</p>
                  <p className="text-slate-900 font-bold text-sm">Actual: {formatUGX(parsedCashActual)}</p>
                  {cashReason && <p className="text-[10px] text-slate-500 italic">"{cashReason}"</p>}
                </div>
              </div>

              {/* Sign-off badge */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">Sign-off Agent</span>
                  <span className="text-slate-500">
                    {currentUser.name} ({currentUser.role})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Submission Mode</span>
                  <span className="font-bold text-indigo-700">Audit-Verified Period Record</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Step
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
            )}
          </div>

          <div>
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as any)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
              >
                <FileCheck2 className="w-4 h-4" />
                Submit EOD Reconciliation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
