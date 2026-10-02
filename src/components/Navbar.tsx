import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatUGX, formatCompactUGX } from '../utils/formatters';
import {
  ShieldAlert,
  Plus,
  ArrowRightLeft,
  Scale,
  RefreshCw,
  Building2,
  UserCheck,
  ChevronDown,
  Layers,
  Sparkles,
  Radio,
} from 'lucide-react';

interface Props {
  onOpenNewTx: (initialType?: 'DEPOSIT' | 'WITHDRAWAL' | 'AIRTIME') => void;
  onOpenTransfer: () => void;
  onOpenRecon: () => void;
  onOpenExpense: () => void;
}

export const Navbar: React.FC<Props> = ({
  onOpenNewTx,
  onOpenTransfer,
  onOpenRecon,
  onOpenExpense,
}) => {
  const {
    currentUser,
    setCurrentUser,
    users,
    branches,
    activeBranchId,
    setActiveBranchId,
    wallets,
    resetAllData,
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  // Compute Total Business Float + Cash across active branch or all
  const filteredWallets = wallets.filter(
    (w) => activeBranchId === 'ALL' || w.branchId === activeBranchId
  );

  const totalCash = filteredWallets
    .filter((w) => w.walletType === 'CASH')
    .reduce((sum, w) => sum + w.currentBalance, 0);

  const totalMtn = filteredWallets
    .filter((w) => w.walletType === 'MTN_FLOAT')
    .reduce((sum, w) => sum + w.currentBalance, 0);

  const totalAirtel = filteredWallets
    .filter((w) => w.walletType === 'AIRTEL_FLOAT')
    .reduce((sum, w) => sum + w.currentBalance, 0);

  const totalLiquidity = totalCash + totalMtn + totalAirtel;

  // Check low float warnings
  const lowFloatWallets = filteredWallets.filter(
    (w) => w.minimumThreshold > 0 && w.currentBalance <= w.minimumThreshold
  );

  const roleColors: Record<string, string> = {
    OWNER: 'bg-purple-100 text-purple-800 border-purple-300',
    MANAGER: 'bg-blue-100 text-blue-800 border-blue-300',
    AGENT: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    AUDITOR: 'bg-amber-100 text-amber-800 border-amber-300',
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left Brand & Active Branch */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-extrabold text-sm shadow-sm ring-2 ring-slate-800">
                KF
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 tracking-tight text-base font-sans">
                    KwikFloat
                  </span>
                  <div className="flex items-center gap-0.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-400" title="MTN MoMo" />
                    <span className="w-2 h-2 rounded-full bg-red-600" title="Airtel Money" />
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Uganda Mobile Money
                </span>
              </div>
            </div>

            {/* Branch Switcher */}
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200">
              <Building2 className="w-4 h-4 text-slate-400" />
              <select
                value={activeBranchId}
                onChange={(e) => setActiveBranchId(e.target.value)}
                className="text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 py-1.5 px-2.5 rounded-lg border border-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">All Branches ({branches.length})</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Center Liquidity Pill */}
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Live Float:</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="font-bold text-slate-900" title="Total Cash + Float">
                {formatUGX(totalLiquidity)}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-amber-700 font-semibold" title="MTN Float">
                M: {formatCompactUGX(totalMtn)}
              </span>
              <span className="text-red-700 font-semibold" title="Airtel Float">
                A: {formatCompactUGX(totalAirtel)}
              </span>
              <span className="text-emerald-700 font-semibold" title="Cash Drawer">
                C: {formatCompactUGX(totalCash)}
              </span>
            </div>
          </div>

          {/* Right Action & User Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Low Float Alert Badge */}
            {lowFloatWallets.length > 0 && (
              <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-xs font-semibold animate-pulse"
                title={`${lowFloatWallets.length} wallet(s) below minimum safety float threshold`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>{lowFloatWallets.length} Low Float!</span>
              </div>
            )}

            {/* Quick Record Action Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowQuickMenu(!showQuickMenu)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Quick Action</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showQuickMenu && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 text-xs"
                  onClick={() => setShowQuickMenu(false)}
                >
                  <button
                    onClick={() => onOpenNewTx('WITHDRAWAL')}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-800 font-semibold"
                  >
                    <Plus className="w-4 h-4 text-emerald-600" />
                    Record Transaction
                  </button>
                  <button
                    onClick={() => onOpenNewTx('AIRTIME')}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-800 font-semibold"
                  >
                    <Radio className="w-4 h-4 text-purple-600" />
                    Load Airtime
                  </button>
                  <button
                    onClick={onOpenTransfer}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-800 font-semibold"
                  >
                    <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                    Transfer Float / Cash
                  </button>
                  <button
                    onClick={onOpenExpense}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-800 font-semibold"
                  >
                    <Sparkles className="w-4 h-4 text-rose-600" />
                    Log Shop Expense
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={onOpenRecon}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-800 font-semibold"
                  >
                    <Scale className="w-4 h-4 text-amber-600" />
                    Daily EOD Reconcile
                  </button>
                </div>
              )}
            </div>

            {/* Role & User Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</p>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                      roleColors[currentUser.role] || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    Simulate Role / Agent Switch
                  </div>
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between ${
                        u.id === currentUser.id ? 'bg-indigo-50 font-bold text-indigo-900' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-xs">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.branchName}</p>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                          roleColors[u.role] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </button>
                  ))}
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={() => {
                      if (window.confirm('Reset all transaction, wallet, and ledger data to initial Uganda demo defaults?')) {
                        resetAllData();
                        setShowUserDropdown(false);
                      }
                    }}
                    className="w-full text-left px-3.5 py-1.5 text-[11px] text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 font-medium"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset to Uganda Demo Data
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
