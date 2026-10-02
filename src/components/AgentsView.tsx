import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';
import { formatUGX, formatUgandanPhone } from '../utils/formatters';
import { Users2, Plus, Building2, Shield, Phone, CreditCard, CheckCircle2 } from 'lucide-react';

export const AgentsView: React.FC = () => {
  const { users, branches, transactions, addUser, currentUser } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [branchId, setBranchId] = useState(branches[0].id);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('AGENT');
  const [cashLimit, setCashLimit] = useState('5000000');
  const [mtnLimit, setMtnLimit] = useState('8000000');
  const [airtelLimit, setAirtelLimit] = useState('6000000');

  const todayStr = new Date().toISOString().slice(0, 10);

  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    const branch = branches.find((b) => b.id === branchId) || branches[0];
    addUser({
      name: name.trim(),
      phone: phone.trim(),
      nationalId: nationalId.trim() || undefined,
      branchId: branch.id,
      branchName: branch.name,
      username: username.trim() || name.toLowerCase().replace(/\s+/g, '.'),
      role,
      status: 'ACTIVE',
      assignedCashLimit: parseInt(cashLimit.replace(/[^0-9]/g, ''), 10) || 5000000,
      assignedMtnLimit: parseInt(mtnLimit.replace(/[^0-9]/g, ''), 10) || 8000000,
      assignedAirtelLimit: parseInt(airtelLimit.replace(/[^0-9]/g, ''), 10) || 6000000,
    });
    setShowAddModal(false);
    setName('');
    setPhone('');
    setUsername('');
    setNationalId('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Agents & Branch Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor teller performance, cash limits, National IDs, and branch assignments.
          </p>
        </div>

        {currentUser.role !== 'AGENT' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add New Agent
          </button>
        )}
      </div>

      {/* Branches Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {branches.map((branch) => {
          const branchAgents = users.filter((u) => u.branchId === branch.id);
          const branchTxs = transactions.filter(
            (t) => t.branchId === branch.id && t.transactionDate.startsWith(todayStr)
          );
          const volume = branchTxs.reduce((sum, t) => sum + t.amount, 0);

          return (
            <div key={branch.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{branch.name}</h3>
                    <p className="text-[10px] text-slate-400">{branch.code} • {branch.location}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {branch.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">Active Tellers:</span>
                  <span className="font-bold text-slate-800">{branchAgents.length} Agents</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">Today's Volume:</span>
                  <span className="font-bold text-indigo-700">{formatUGX(volume)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Agents Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => {
          // Agent specific today's metrics (PRD Section 8)
          const agentTxs = transactions.filter(
            (t) => t.agentId === user.id && t.transactionDate.startsWith(todayStr)
          );
          const depositsCount = agentTxs.filter((t) => t.type === 'DEPOSIT').length;
          const withdrawalsCount = agentTxs.filter((t) => t.type === 'WITHDRAWAL').length;
          const agentVolume = agentTxs.reduce((sum, t) => sum + t.amount, 0);
          const agentComm = agentTxs.reduce((sum, t) => sum + t.commission, 0);

          return (
            <div key={user.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{user.name}</h3>
                    <p className="text-[11px] text-slate-400">@{user.username} • {user.branchName}</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {user.role}
                </span>
              </div>

              {/* Contact & ID */}
              <div className="space-y-1 text-xs text-slate-600 font-mono">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatUgandanPhone(user.phone)}</span>
                </div>
                {user.nationalId && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>NIN: {user.nationalId}</span>
                  </div>
                )}
              </div>

              {/* Agent Performance Box (PRD Section 8) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span>Today's Performance</span>
                  <span className="text-[11px] text-indigo-600">{agentTxs.length} Transactions</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">Cash In / Out</span>
                    <span className="text-slate-800 font-semibold">{depositsCount} In • {withdrawalsCount} Out</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">Commission Earned</span>
                    <span className="text-emerald-700 font-bold">{formatUGX(agentComm)}</span>
                  </div>
                </div>
                <div className="pt-1.5 border-t border-slate-200 flex justify-between text-[11px] font-mono">
                  <span className="text-slate-500 font-sans">Total Volume:</span>
                  <span className="font-bold text-slate-900">{formatUGX(agentVolume)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Add New Mobile Money Agent / Teller</h3>

            <form onSubmit={handleAddAgent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kasumba Peter"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0772 900 123"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">National ID (NIN)</label>
                  <input
                    type="text"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="CM98012345ABCD"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Branch</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-semibold"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-semibold"
                  >
                    <option value="AGENT">Agent / Teller</option>
                    <option value="MANAGER">Branch Manager</option>
                    <option value="AUDITOR">Auditor / Accountant</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="peter.kasumba"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Create Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
