import React from 'react';
import { useApp } from '../context/AppContext';
import { formatUGX, formatCompactUGX, formatDateTime } from '../utils/formatters';
import {
  Banknote,
  Smartphone,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowRightLeft,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  TrendingUp,
  Percent,
  ShieldAlert,
  Calendar,
  Building,
  ArrowRight,
  Radio,
} from 'lucide-react';

interface Props {
  onOpenNewTx: (initialType?: 'DEPOSIT' | 'WITHDRAWAL' | 'AIRTIME') => void;
  onOpenTransfer: () => void;
  onOpenRecon: () => void;
  onOpenExpense: () => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<Props> = ({
  onOpenNewTx,
  onOpenTransfer,
  onOpenRecon,
  onOpenExpense,
  onNavigateTab,
}) => {
  const {
    wallets,
    transactions,
    expenses,
    reconciliations,
    activeBranchId,
    branches,
    currentUser,
  } = useApp();

  const todayStr = new Date().toISOString().slice(0, 10);

  // Filter based on active branch
  const filteredWallets = wallets.filter(
    (w) => activeBranchId === 'ALL' || w.branchId === activeBranchId
  );

  const filteredTransactions = transactions.filter(
    (t) => activeBranchId === 'ALL' || t.branchId === activeBranchId
  );

  const filteredExpenses = expenses.filter(
    (e) => activeBranchId === 'ALL' || e.branchId === activeBranchId
  );

  // 1. Wallets calculations
  const cashWallets = filteredWallets.filter((w) => w.walletType === 'CASH');
  const mtnWallets = filteredWallets.filter((w) => w.walletType === 'MTN_FLOAT');
  const airtelWallets = filteredWallets.filter((w) => w.walletType === 'AIRTEL_FLOAT');

  const totalCash = cashWallets.reduce((sum, w) => sum + w.currentBalance, 0);
  const totalMtn = mtnWallets.reduce((sum, w) => sum + w.currentBalance, 0);
  const totalAirtel = airtelWallets.reduce((sum, w) => sum + w.currentBalance, 0);
  const totalLiquidity = totalCash + totalMtn + totalAirtel;

  // 2. Today's Transactions
  const todayTxs = filteredTransactions.filter(
    (t) => t.status === 'COMPLETED' && t.transactionDate.startsWith(todayStr)
  );

  const todayDeposits = todayTxs.filter((t) => t.type === 'DEPOSIT');
  const todayWithdrawals = todayTxs.filter((t) => t.type === 'WITHDRAWAL');
  const todayAirtime = todayTxs.filter((t) => t.type === 'AIRTIME');

  const depositVolume = todayDeposits.reduce((sum, t) => sum + t.amount, 0);
  const withdrawalVolume = todayWithdrawals.reduce((sum, t) => sum + t.amount, 0);
  const airtimeVolume = todayAirtime.reduce((sum, t) => sum + t.amount, 0);
  const totalVolume = depositVolume + withdrawalVolume + airtimeVolume;

  // 3. Earnings & Expenses
  const mtnCommissions = todayTxs
    .filter((t) => t.provider === 'MTN')
    .reduce((sum, t) => sum + t.commission, 0);
  const airtelCommissions = todayTxs
    .filter((t) => t.provider === 'AIRTEL')
    .reduce((sum, t) => sum + t.commission, 0);
  const totalCommissions = mtnCommissions + airtelCommissions;

  const todayExpenses = filteredExpenses
    .filter((e) => e.expenseDate === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  const netOperatingProfit = totalCommissions - todayExpenses;

  // 4. Reconciliation Status check
  const latestRecon = reconciliations.find(
    (r) => activeBranchId === 'ALL' || r.branchId === activeBranchId
  );
  const isReconciledToday = latestRecon && latestRecon.date === todayStr;

  // Low Float Warnings
  const lowFloatWallets = filteredWallets.filter(
    (w) => w.minimumThreshold > 0 && w.currentBalance <= w.minimumThreshold
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Hero Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
              Daily Operational Cockpit
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Mobile Money Float & Cash Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time ledger visibility for Uganda MTN MoMo and Airtel Money agent operations.
          </p>
        </div>

        {/* Quick Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenNewTx('WITHDRAWAL')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <ArrowDownRight className="w-4 h-4" />
            Cash Out
          </button>
          <button
            onClick={() => onOpenNewTx('DEPOSIT')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4" />
            Cash In
          </button>
          <button
            onClick={() => onOpenNewTx('AIRTIME')}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Radio className="w-4 h-4" />
            Load Airtime
          </button>
          <button
            onClick={onOpenTransfer}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Transfer Float
          </button>
        </div>
      </div>

      {/* Low Float Alert Bar (if any) */}
      {lowFloatWallets.length > 0 && (
        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900">
                Low Float Alert: {lowFloatWallets.map((w) => w.accountName).join(', ')}
              </p>
              <p className="text-[11px] text-amber-700">
                Current balance has fallen below minimum safety threshold. Rebalance via Float Transfer or Bank capitalization immediately.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenTransfer}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex-shrink-0"
          >
            Rebalance Float
          </button>
        </div>
      )}

      {/* SECTION 1: THE THREE CORE WALLETS (PRD Question 1 & 2) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <span>Core Float & Cash Wallets</span>
            <span className="text-[11px] font-normal text-slate-400">
              (Total Liquidity: {formatUGX(totalLiquidity)})
            </span>
          </h2>
          <button
            onClick={() => onNavigateTab('ledger')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View Full Double-Entry Ledger <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CASH WALLET */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full pointer-events-none -mr-4 -mt-4 transition-transform group-hover:scale-105" />
            <div className="flex items-center justify-between mb-3 relative">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm">Physical Cash</span>
                  <p className="text-[11px] text-slate-400">Cash Drawer / Safe</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Safe Ready
              </span>
            </div>

            <div className="space-y-1 mb-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {formatUGX(totalCash)}
              </span>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                <span>Inflow: +{formatCompactUGX(withdrawalVolume)}</span>
                <span>•</span>
                <span>Outflow: -{formatCompactUGX(depositVolume + todayExpenses)}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Minimum Safe Limit</span>
              <span className="font-mono font-semibold text-slate-700">UGX 500,000</span>
            </div>
          </div>

          {/* MTN FLOAT WALLET */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden group hover:border-yellow-400 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-bl-full pointer-events-none -mr-4 -mt-4 transition-transform group-hover:scale-105" />
            <div className="flex items-center justify-between mb-3 relative">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-400 text-slate-950 flex items-center justify-center font-extrabold text-sm shadow-xs">
                  M
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm">MTN Float</span>
                  <p className="text-[11px] text-slate-400">MoMo Line *165#</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                SIM Active
              </span>
            </div>

            <div className="space-y-1 mb-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {formatUGX(totalMtn)}
              </span>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                <span>Today's Commission: {formatUGX(mtnCommissions)}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Safe Float Threshold</span>
              <span className="font-mono font-semibold text-slate-700">UGX 1,000,000</span>
            </div>
          </div>

          {/* AIRTEL FLOAT WALLET */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden group hover:border-red-400 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full pointer-events-none -mr-4 -mt-4 transition-transform group-hover:scale-105" />
            <div className="flex items-center justify-between mb-3 relative">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                  A
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm">Airtel Float</span>
                  <p className="text-[11px] text-slate-400">Airtel Money *185#</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                SIM Active
              </span>
            </div>

            <div className="space-y-1 mb-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {formatUGX(totalAirtel)}
              </span>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                <span>Today's Commission: {formatUGX(airtelCommissions)}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Safe Float Threshold</span>
              <span className="font-mono font-semibold text-slate-700">UGX 800,000</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: TODAY'S OPERATIONS & FINANCIAL BREAKDOWN (PRD Questions 3 & 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Transactions & Earnings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Transactions Overview */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Today's Transactions Summary</h3>
                <p className="text-xs text-slate-500">{todayTxs.length} completed transactions today</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block font-medium">Total Volume Moved</span>
                <span className="text-lg font-extrabold text-indigo-700 font-mono">
                  {formatUGX(totalVolume)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                <span className="text-[10px] font-bold text-blue-800 uppercase block">Cash In</span>
                <span className="text-base font-extrabold text-blue-900 font-mono block">
                  {formatCompactUGX(depositVolume)}
                </span>
                <span className="text-[11px] text-blue-700">{todayDeposits.length} txs</span>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Cash Out</span>
                <span className="text-base font-extrabold text-emerald-900 font-mono block">
                  {formatCompactUGX(withdrawalVolume)}
                </span>
                <span className="text-[11px] text-emerald-700">{todayWithdrawals.length} txs</span>
              </div>

              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                <span className="text-[10px] font-bold text-purple-800 uppercase block">Load Airtime</span>
                <span className="text-base font-extrabold text-purple-900 font-mono block">
                  {formatCompactUGX(airtimeVolume)}
                </span>
                <span className="text-[11px] text-purple-700">{todayAirtime.length} txs</span>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Gross Comm.</span>
                <span className="text-base font-extrabold text-amber-900 font-mono block">
                  {formatUGX(totalCommissions)}
                </span>
                <span className="text-[11px] text-amber-700">M: {formatCompactUGX(mtnCommissions)} | A: {formatCompactUGX(airtelCommissions)}</span>
              </div>

              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl">
                <span className="text-[10px] font-bold text-rose-800 uppercase block">Today's Exp.</span>
                <span className="text-base font-extrabold text-rose-900 font-mono block">
                  {formatUGX(todayExpenses)}
                </span>
                <span className="text-[11px] text-rose-700">Net: {formatUGX(netOperatingProfit)}</span>
              </div>
            </div>
          </div>

          {/* Recent Transactions List */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Recent Ledger Transactions</h3>
                <p className="text-xs text-slate-500">Live feed of transactions recorded across registers</p>
              </div>
              <button
                onClick={() => onNavigateTab('transactions')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View All ({filteredTransactions.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredTransactions.slice(0, 5).map((tx) => {
                const isMTN = tx.provider === 'MTN';
                const isDeposit = tx.type === 'DEPOSIT';
                return (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                          isMTN ? 'bg-yellow-400 text-black' : 'bg-red-600 text-white'
                        }`}
                      >
                        {isMTN ? 'M' : 'A'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                          <span>
                            {tx.provider}{' '}
                            {tx.type === 'DEPOSIT'
                              ? 'Cash In'
                              : tx.type === 'AIRTIME'
                              ? 'Airtime'
                              : 'Cash Out'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            • {tx.customerPhone} {tx.customerName ? `(${tx.customerName})` : ''}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Ref: {tx.providerReference} • Agent: {tx.agentName}
                        </p>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="font-bold text-slate-900 block text-xs">
                        {formatUGX(tx.amount)}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold block">
                        +Comm: {formatUGX(tx.commission)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: RECONCILIATION HEALTH & PROFITABILITY (PRD Question 5) */}
        <div className="space-y-6">
          {/* EOD Reconciliation Status Widget */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-slate-400" />
                Reconciliation Health
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Daily Close</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">MTN Float Balance:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Balanced
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Airtel Float Balance:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Balanced
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Physical Cash Drawer:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Balanced
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={onOpenRecon}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Scale className="w-4 h-4 text-emerald-400" />
                Run Today's EOD Reconciliation
              </button>
              <p className="text-[11px] text-slate-400 text-center">
                Count notes & verify USSD SIM balances before close
              </p>
            </div>
          </div>

          {/* Net Profitability Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Operating Profitability
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                Today
              </span>
            </div>

            <div>
              <span className="text-xs text-indigo-200 block">Net Commission Profit</span>
              <span className="text-2xl font-extrabold font-mono tracking-tight">
                {formatUGX(netOperatingProfit)}
              </span>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-indigo-800 text-xs font-mono">
              <div className="flex justify-between text-indigo-200">
                <span>Gross Commissions:</span>
                <span className="text-white font-bold">{formatUGX(totalCommissions)}</span>
              </div>
              <div className="flex justify-between text-indigo-200">
                <span>Shop Expenses:</span>
                <span className="text-rose-400">-{formatUGX(todayExpenses)}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={onOpenExpense}
                className="text-xs text-indigo-200 hover:text-white flex items-center gap-1 underline"
              >
                + Record Expense
              </button>
              <button
                onClick={() => onNavigateTab('reports')}
                className="text-xs text-indigo-200 hover:text-white flex items-center gap-1 underline"
              >
                P&L Statement &rarr;
              </button>
            </div>
          </div>

          {/* Quick Support / USSD info */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs text-xs space-y-2">
            <span className="font-bold text-slate-900 block">Uganda Agent USSD Shortcodes</span>
            <div className="space-y-1 font-mono text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>MTN MoMo Float Check:</span>
                <span className="font-bold text-yellow-700">*165# / *165*6#</span>
              </div>
              <div className="flex justify-between">
                <span>Airtel Money Float Check:</span>
                <span className="font-bold text-red-700">*185# / *185*9#</span>
              </div>
              <div className="flex justify-between">
                <span>Super Agent Banking:</span>
                <span className="font-bold text-indigo-700">*247# (Stanbic)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
