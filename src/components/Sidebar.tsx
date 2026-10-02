import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  ArrowDownUp,
  BookOpenText,
  ArrowRightLeft,
  Scale,
  Percent,
  Receipt,
  Users2,
  BarChart3,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'transactions'
  | 'ledger'
  | 'transfers'
  | 'reconciliation'
  | 'commissions'
  | 'expenses'
  | 'agents'
  | 'reports'
  | 'audit';

interface Props {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const { transactions, reconciliations, wallets, currentUser } = useApp();

  // Check today's transactions count
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTxCount = transactions.filter((t) => t.transactionDate.startsWith(todayStr)).length;

  // Check pending reconciliations
  const pendingReconCount = reconciliations.filter((r) => r.status === 'VARIANCE_PENDING').length;

  // Check low float count
  const lowFloatCount = wallets.filter(
    (w) => w.minimumThreshold > 0 && w.currentBalance <= w.minimumThreshold
  ).length;

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: ArrowDownUp,
      badge: todayTxCount > 0 ? todayTxCount : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'ledger',
      label: 'Wallets & Ledger',
      icon: BookOpenText,
      badge: lowFloatCount > 0 ? `${lowFloatCount} Low` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'transfers',
      label: 'Float Transfers',
      icon: ArrowRightLeft,
    },
    {
      id: 'reconciliation',
      label: 'Daily Reconciliation',
      icon: Scale,
      badge: pendingReconCount > 0 ? `${pendingReconCount} Review` : undefined,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'commissions',
      label: 'Commissions Engine',
      icon: Percent,
    },
    {
      id: 'expenses',
      label: 'Expenses Log',
      icon: Receipt,
    },
    {
      id: 'agents',
      label: 'Agents & Branches',
      icon: Users2,
    },
    {
      id: 'reports',
      label: 'Financial Reports',
      icon: BarChart3,
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: ShieldCheck,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col justify-between hidden md:flex">
      <div className="p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Operations & Control
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Role Footer Card */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-600 font-medium">Session: {currentUser.role}</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
          Logged as {currentUser.username} • {currentUser.branchName}
        </p>
      </div>
    </aside>
  );
};
