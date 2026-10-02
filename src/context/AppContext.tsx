import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Branch,
  User,
  Wallet,
  LedgerEntry,
  Transaction,
  WalletTransfer,
  CommissionRule,
  Expense,
  ReconciliationRecord,
  AuditLog,
  Provider,
  TransactionType,
  UserRole,
} from '../types';
import {
  INITIAL_BRANCHES,
  INITIAL_USERS,
  INITIAL_WALLETS,
  INITIAL_COMMISSION_RULES,
  INITIAL_TRANSACTIONS,
  INITIAL_LEDGER_ENTRIES,
  INITIAL_TRANSFERS,
  INITIAL_EXPENSES,
  INITIAL_RECONCILIATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';
import {
  OFFICIAL_UGANDA_TARIFF_RULES,
  computeTariffBreakdown,
  TariffBreakdown,
  OFFICIAL_TARIFF_SOURCES,
} from '../data/officialTariffs';

export type { TariffBreakdown };

interface AppContextType {
  // Current user & role
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;

  // Branches
  branches: Branch[];
  activeBranchId: string; // 'ALL' or specific branchId
  setActiveBranchId: (id: string) => void;

  // Wallets & Ledger
  wallets: Wallet[];
  ledgerEntries: LedgerEntry[];
  addWallet: (wallet: Omit<Wallet, 'id' | 'currentBalance' | 'updatedAt'>) => void;
  updateWalletThreshold: (walletId: string, minThreshold: number) => void;
  adjustWalletBalance: (walletId: string, adjustmentAmount: number, reason: string) => void;
  getWalletBalanceFromLedger: (walletId: string) => number;

  // Transactions
  transactions: Transaction[];
  recordTransaction: (tx: {
    provider: Provider;
    type: TransactionType;
    amount: number;
    customerPhone: string;
    customerName?: string;
    notes?: string;
    smsRawText?: string;
    customCommission?: number;
  }) => { success: boolean; transaction?: Transaction; error?: string };
  reverseTransaction: (txId: string, reason: string) => { success: boolean; error?: string };

  // Float Transfers
  transfers: WalletTransfer[];
  executeFloatTransfer: (data: {
    sourceWalletId: string;
    destinationWalletId: string;
    amount: number;
    fee?: number;
    reason: string;
    reference?: string;
  }) => { success: boolean; error?: string };

  // Commissions & Official Tariffs
  commissionRules: CommissionRule[];
  calculateCommission: (provider: Provider, type: TransactionType, amount: number) => number;
  getTariffBreakdown: (provider: Provider, type: TransactionType, amount: number) => TariffBreakdown;
  saveCommissionRule: (rule: CommissionRule) => void;
  deleteCommissionRule: (ruleId: string) => void;
  resetToOfficialTariffs: () => void;

  // Expenses
  expenses: Expense[];
  recordExpense: (data: {
    category: Expense['category'];
    amount: number;
    paymentWalletId: string;
    description: string;
    receiptNumber?: string;
    expenseDate?: string;
  }) => { success: boolean; error?: string };

  // Reconciliations
  reconciliations: ReconciliationRecord[];
  submitReconciliation: (record: Omit<ReconciliationRecord, 'id' | 'reconciliationNumber' | 'createdAt'>) => {
    success: boolean;
    error?: string;
  };
  approveReconciliation: (recId: string, approvalNotes: string) => void;

  // Audit Logs
  auditLogs: AuditLog[];

  // Global actions
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'KWIKFLOAT_APP_STATE_V1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage if available
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_USERS`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_CURRENT_USER`);
    return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // Harrison Kangaho (Owner)
  });

  const [branches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [activeBranchId, setActiveBranchId] = useState<string>('ALL');

  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_WALLETS`);
    return saved ? JSON.parse(saved) : INITIAL_WALLETS;
  });

  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_LEDGER`);
    return saved ? JSON.parse(saved) : INITIAL_LEDGER_ENTRIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_TXS`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_COMMISSIONS`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CommissionRule[];
        return parsed.map((r) =>
          r.transactionType === 'AIRTIME'
            ? { ...r, commissionValue: 4, description: r.description.replace('5%', '4%') }
            : r
        );
      } catch {
        return INITIAL_COMMISSION_RULES;
      }
    }
    return INITIAL_COMMISSION_RULES;
  });

  const [transfers, setTransfers] = useState<WalletTransfer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_TRANSFERS`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSFERS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_EXPENSES`);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [reconciliations, setReconciliations] = useState<ReconciliationRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_RECON`);
    return saved ? JSON.parse(saved) : INITIAL_RECONCILIATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_AUDIT`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Sync back to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_USERS`, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_CURRENT_USER`, JSON.stringify(currentUser));
  }, [currentUser]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_WALLETS`, JSON.stringify(wallets));
  }, [wallets]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_LEDGER`, JSON.stringify(ledgerEntries));
  }, [ledgerEntries]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_TXS`, JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_COMMISSIONS`, JSON.stringify(commissionRules));
  }, [commissionRules]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_TRANSFERS`, JSON.stringify(transfers));
  }, [transfers]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_EXPENSES`, JSON.stringify(expenses));
  }, [expenses]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_RECON`, JSON.stringify(reconciliations));
  }, [reconciliations]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_AUDIT`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  const logAudit = (
    action: string,
    entityType: AuditLog['entityType'],
    entityId: string,
    details: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ) => {
    const newEntry: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      details,
      oldValues,
      newValues,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  /**
   * Authoritative balance calculation from Ledger entries
   */
  const getWalletBalanceFromLedger = (walletId: string): number => {
    const wallet = wallets.find((w) => w.id === walletId);
    if (!wallet) return 0;
    const entries = ledgerEntries.filter((l) => l.walletId === walletId);
    const sumEntries = entries.reduce((acc, curr) => acc + curr.amount, 0);
    return wallet.openingBalance + sumEntries;
  };

  /**
   * Dynamic Tiered Commission Calculation
   */
  const calculateCommission = (provider: Provider, type: TransactionType, amount: number): number => {
    // Only calculate for types that have commission rules
    const matchingRules = commissionRules.filter(
      (r) => r.provider === provider && r.transactionType === type && amount >= r.minAmount && amount <= r.maxAmount
    );

    if (matchingRules.length > 0) {
      const rule = matchingRules[0];
      if (rule.commissionType === 'FIXED') {
        return rule.commissionValue;
      } else {
        return Math.round((amount * rule.commissionValue) / 100);
      }
    }

    // Default fallback percentage if no tier matched (0.5% for withdrawal, 0.25% for deposit, 4% for airtime)
    if (type === 'WITHDRAWAL') return Math.max(100, Math.round(amount * 0.007));
    if (type === 'DEPOSIT') return Math.max(100, Math.round(amount * 0.003));
    if (type === 'AIRTIME') return Math.max(50, Math.round(amount * 0.04));
    return 100;
  };

  /**
   * Complete Official Uganda Tariff & Fee Breakdown Calculator
   */
  const getTariffBreakdown = (
    provider: Provider,
    type: TransactionType,
    amount: number
  ): TariffBreakdown => {
    return computeTariffBreakdown(provider, type, amount, commissionRules);
  };

  /**
   * Record Transaction with Double-Entry Ledger
   */
  const recordTransaction = (txData: {
    provider: Provider;
    type: TransactionType;
    amount: number;
    customerPhone: string;
    customerName?: string;
    notes?: string;
    smsRawText?: string;
    customCommission?: number;
  }): { success: boolean; transaction?: Transaction; error?: string } => {
    const branchId = currentUser.branchId;
    const branch = branches.find((b) => b.id === branchId) || branches[0];

    // Find corresponding Cash Wallet and Provider Wallet for this branch
    const cashWallet = wallets.find((w) => w.branchId === branchId && w.walletType === 'CASH') || wallets[0];
    const providerWalletType = txData.provider === 'MTN' ? 'MTN_FLOAT' : 'AIRTEL_FLOAT';
    const floatWallet =
      wallets.find((w) => w.branchId === branchId && w.walletType === providerWalletType) ||
      wallets.find((w) => w.walletType === providerWalletType)!;

    if (!cashWallet || !floatWallet) {
      return { success: false, error: 'Required branch cash or float wallet not found' };
    }

    // Validate float sufficiency if withdrawal or deposit
    // In deposit: Float is credited to customer (+float in PRD model or checks)
    const commission =
      txData.customCommission !== undefined
        ? txData.customCommission
        : calculateCommission(txData.provider, txData.type, txData.amount);

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const txId = `tx-${Date.now()}`;
    const txNumber = `MM-${dateStr}-${String(transactions.length + 1).padStart(4, '0')}`;
    const providerRef = `${txData.provider === 'MTN' ? 'MP' : 'AM'}${dateStr}.${now.getHours()}${now.getMinutes()}.${Math.floor(10000 + Math.random() * 90000)}`;

    const newTx: Transaction = {
      id: txId,
      transactionNumber: txNumber,
      provider: txData.provider,
      type: txData.type,
      amount: txData.amount,
      customerPhone: txData.customerPhone,
      customerName: txData.customerName,
      agentId: currentUser.id,
      agentName: currentUser.name,
      branchId: branch.id,
      branchName: branch.name,
      commission,
      providerReference: providerRef,
      status: 'COMPLETED',
      transactionDate: now.toISOString(),
      notes: txData.notes,
      smsRawText: txData.smsRawText,
    };

    // Double-Entry Ledger according to PRD Section 4, 5, 6:
    // Deposit: Float += amount, Cash -= amount
    // Withdrawal: Float -= amount, Cash += amount
    const floatChange = txData.type === 'DEPOSIT' ? txData.amount : -txData.amount;
    const cashChange = txData.type === 'DEPOSIT' ? -txData.amount : txData.amount;

    const floatBalBefore = floatWallet.currentBalance;
    const floatBalAfter = floatBalBefore + floatChange;

    const cashBalBefore = cashWallet.currentBalance;
    const cashBalAfter = cashBalBefore + cashChange;

    const entryTypeForTx =
      txData.type === 'DEPOSIT'
        ? 'CUSTOMER_DEPOSIT'
        : txData.type === 'AIRTIME'
        ? 'CUSTOMER_AIRTIME'
        : 'CUSTOMER_WITHDRAWAL';

    const floatLedgerEntry: LedgerEntry = {
      id: `ledg-${Date.now()}-flt`,
      walletId: floatWallet.id,
      walletName: floatWallet.accountName,
      walletType: floatWallet.walletType,
      transactionId: txId,
      entryType: entryTypeForTx,
      amount: floatChange,
      balanceBefore: floatBalBefore,
      balanceAfter: floatBalAfter,
      reference: providerRef,
      description: `${txData.provider} ${txData.type}: ${txData.customerPhone} ${txData.customerName || ''}`,
      performedBy: currentUser.name,
      createdAt: now.toISOString(),
    };

    const cashLedgerEntry: LedgerEntry = {
      id: `ledg-${Date.now()}-csh`,
      walletId: cashWallet.id,
      walletName: cashWallet.accountName,
      walletType: 'CASH',
      transactionId: txId,
      entryType: entryTypeForTx,
      amount: cashChange,
      balanceBefore: cashBalBefore,
      balanceAfter: cashBalAfter,
      reference: providerRef,
      description: `Cash register ${txData.type === 'DEPOSIT' ? 'outflow' : 'inflow'} for ${txData.provider} ${txData.type}`,
      performedBy: currentUser.name,
      createdAt: now.toISOString(),
    };

    // Update states atomically
    setTransactions((prev) => [newTx, ...prev]);
    setLedgerEntries((prev) => [floatLedgerEntry, cashLedgerEntry, ...prev]);

    setWallets((prev) =>
      prev.map((w) => {
        if (w.id === floatWallet.id) {
          return { ...w, currentBalance: floatBalAfter, updatedAt: now.toISOString() };
        }
        if (w.id === cashWallet.id) {
          return { ...w, currentBalance: cashBalAfter, updatedAt: now.toISOString() };
        }
        return w;
      })
    );

    logAudit(
      'RECORDED_TRANSACTION',
      'TRANSACTION',
      txId,
      `Recorded ${txData.provider} ${txData.type} UGX ${txData.amount.toLocaleString()} for ${txData.customerPhone}. Commission: UGX ${commission.toLocaleString()}`,
      undefined,
      { amount: txData.amount, provider: txData.provider, phone: txData.customerPhone, ref: providerRef }
    );

    return { success: true, transaction: newTx };
  };

  /**
   * Reverse Transaction with full audit and reverse ledger entries
   */
  const reverseTransaction = (txId: string, reason: string): { success: boolean; error?: string } => {
    if (currentUser.role === 'AGENT') {
      return { success: false, error: 'Only Managers, Owners, or Auditors can reverse transactions' };
    }

    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return { success: false, error: 'Transaction not found' };
    if (tx.status === 'REVERSED') return { success: false, error: 'Transaction is already reversed' };

    const now = new Date();
    const branchId = tx.branchId;
    const cashWallet = wallets.find((w) => w.branchId === branchId && w.walletType === 'CASH') || wallets[0];
    const providerWalletType = tx.provider === 'MTN' ? 'MTN_FLOAT' : 'AIRTEL_FLOAT';
    const floatWallet =
      wallets.find((w) => w.branchId === branchId && w.walletType === providerWalletType) ||
      wallets.find((w) => w.walletType === providerWalletType)!;

    // Opposite delta
    const origFloatChange = tx.type === 'DEPOSIT' ? tx.amount : -tx.amount;
    const origCashChange = tx.type === 'DEPOSIT' ? -tx.amount : tx.amount;

    const reverseFloatChange = -origFloatChange;
    const reverseCashChange = -origCashChange;

    const floatBalBefore = floatWallet.currentBalance;
    const floatBalAfter = floatBalBefore + reverseFloatChange;

    const cashBalBefore = cashWallet.currentBalance;
    const cashBalAfter = cashBalBefore + reverseCashChange;

    const revFloatEntry: LedgerEntry = {
      id: `ledg-${Date.now()}-rev-flt`,
      walletId: floatWallet.id,
      walletName: floatWallet.accountName,
      walletType: floatWallet.walletType,
      transactionId: txId,
      entryType: 'REVERSAL',
      amount: reverseFloatChange,
      balanceBefore: floatBalBefore,
      balanceAfter: floatBalAfter,
      reference: `REV-${tx.providerReference}`,
      description: `REVERSAL of ${tx.transactionNumber}: ${reason}`,
      performedBy: currentUser.name,
      createdAt: now.toISOString(),
    };

    const revCashEntry: LedgerEntry = {
      id: `ledg-${Date.now()}-rev-csh`,
      walletId: cashWallet.id,
      walletName: cashWallet.accountName,
      walletType: 'CASH',
      transactionId: txId,
      entryType: 'REVERSAL',
      amount: reverseCashChange,
      balanceBefore: cashBalBefore,
      balanceAfter: cashBalAfter,
      reference: `REV-${tx.providerReference}`,
      description: `REVERSAL cash adjustment for ${tx.transactionNumber}: ${reason}`,
      performedBy: currentUser.name,
      createdAt: now.toISOString(),
    };

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txId
          ? {
              ...t,
              status: 'REVERSED',
              reversalReason: reason,
              reversedAt: now.toISOString(),
              reversedBy: currentUser.name,
            }
          : t
      )
    );

    setLedgerEntries((prev) => [revFloatEntry, revCashEntry, ...prev]);

    setWallets((prev) =>
      prev.map((w) => {
        if (w.id === floatWallet.id) return { ...w, currentBalance: floatBalAfter, updatedAt: now.toISOString() };
        if (w.id === cashWallet.id) return { ...w, currentBalance: cashBalAfter, updatedAt: now.toISOString() };
        return w;
      })
    );

    logAudit(
      'REVERSED_TRANSACTION',
      'TRANSACTION',
      txId,
      `Reversed transaction ${tx.transactionNumber} (UGX ${tx.amount.toLocaleString()}). Reason: ${reason}`,
      { status: 'COMPLETED' },
      { status: 'REVERSED', reversalReason: reason }
    );

    return { success: true };
  };

  /**
   * Float Rebalancing Transfer between wallets
   */
  const executeFloatTransfer = (data: {
    sourceWalletId: string;
    destinationWalletId: string;
    amount: number;
    fee?: number;
    reason: string;
    reference?: string;
  }): { success: boolean; error?: string } => {
    if (data.sourceWalletId === data.destinationWalletId) {
      return { success: false, error: 'Source and destination wallets must be different' };
    }
    if (data.amount <= 0) {
      return { success: false, error: 'Transfer amount must be greater than zero' };
    }

    const sourceWallet = wallets.find((w) => w.id === data.sourceWalletId);
    const destWallet = wallets.find((w) => w.id === data.destinationWalletId);

    if (!sourceWallet || !destWallet) {
      return { success: false, error: 'One or both wallets not found' };
    }

    const fee = data.fee || 0;
    const totalDeduction = data.amount + fee;

    const now = new Date();
    const trfId = `trf-${Date.now()}`;
    const trfNumber = `TRF-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${String(transfers.length + 1).padStart(3, '0')}`;
    const ref = data.reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`;

    const newTransfer: WalletTransfer = {
      id: trfId,
      transferNumber: trfNumber,
      sourceWalletId: sourceWallet.id,
      sourceWalletName: sourceWallet.accountName,
      destinationWalletId: destWallet.id,
      destinationWalletName: destWallet.accountName,
      amount: data.amount,
      fee,
      reference: ref,
      reason: data.reason,
      branchId: sourceWallet.branchId,
      createdBy: currentUser.name,
      createdAt: now.toISOString(),
    };

    const srcBalBefore = sourceWallet.currentBalance;
    const srcBalAfter = srcBalBefore - totalDeduction;

    const dstBalBefore = destWallet.currentBalance;
    const dstBalAfter = dstBalBefore + data.amount;

    const srcLedgerEntry: LedgerEntry = {
      id: `ledg-${Date.now()}-trf-src`,
      walletId: sourceWallet.id,
      walletName: sourceWallet.accountName,
      walletType: sourceWallet.walletType,
      transferId: trfId,
      entryType: 'FLOAT_TRANSFER_OUT',
      amount: -totalDeduction,
      balanceBefore: srcBalBefore,
      balanceAfter: srcBalAfter,
      reference: ref,
      description: `Transfer OUT to ${destWallet.accountName}: ${data.reason}`,
      performedBy: currentUser.name,
      createdAt: now.toISOString(),
    };

    const dstLedgerEntry: LedgerEntry = {
      id: `ledg-${Date.now()}-trf-dst`,
      walletId: destWallet.id,
      walletName: destWallet.accountName,
      walletType: destWallet.walletType,
      transferId: trfId,
      entryType: 'FLOAT_TRANSFER_IN',
      amount: data.amount,
      balanceBefore: dstBalBefore,
      balanceAfter: dstBalAfter,
      reference: ref,
      description: `Transfer IN from ${sourceWallet.accountName}: ${data.reason}`,
      performedBy: currentUser.name,
      createdAt: now.toISOString(),
    };

    setTransfers((prev) => [newTransfer, ...prev]);
    setLedgerEntries((prev) => [srcLedgerEntry, dstLedgerEntry, ...prev]);

    setWallets((prev) =>
      prev.map((w) => {
        if (w.id === sourceWallet.id) return { ...w, currentBalance: srcBalAfter, updatedAt: now.toISOString() };
        if (w.id === destWallet.id) return { ...w, currentBalance: dstBalAfter, updatedAt: now.toISOString() };
        return w;
      })
    );

    logAudit(
      'FLOAT_TRANSFER',
      'FLOAT_TRANSFER',
      trfId,
      `Transferred UGX ${data.amount.toLocaleString()} from ${sourceWallet.accountName} to ${destWallet.accountName}. Reason: ${data.reason}`,
      undefined,
      { from: sourceWallet.accountName, to: destWallet.accountName, amount: data.amount, fee }
    );

    return { success: true };
  };

  /**
   * Record operational expense
   */
  const recordExpense = (data: {
    category: Expense['category'];
    amount: number;
    paymentWalletId: string;
    description: string;
    receiptNumber?: string;
    expenseDate?: string;
  }): { success: boolean; error?: string } => {
    const wallet = wallets.find((w) => w.id === data.paymentWalletId);
    if (!wallet) return { success: false, error: 'Payment wallet not found' };

    const branch = branches.find((b) => b.id === wallet.branchId) || branches[0];
    const now = new Date();
    const expId = `exp-${Date.now()}`;

    const newExpense: Expense = {
      id: expId,
      category: data.category,
      amount: data.amount,
      paymentWalletId: wallet.id,
      paymentWalletName: wallet.accountName,
      branchId: branch.id,
      branchName: branch.name,
      description: data.description,
      receiptNumber: data.receiptNumber,
      recordedBy: currentUser.name,
      expenseDate: data.expenseDate || now.toISOString().slice(0, 10),
      createdAt: now.toISOString(),
    };

    const balBefore = wallet.currentBalance;
    const balAfter = balBefore - data.amount;

    const ledgerEntry: LedgerEntry = {
      id: `ledg-${Date.now()}-exp`,
      walletId: wallet.id,
      walletName: wallet.accountName,
      walletType: wallet.walletType,
      expenseId: expId,
      entryType: 'EXPENSE_PAYMENT',
      amount: -data.amount,
      balanceBefore: balBefore,
      balanceAfter: balAfter,
      reference: data.receiptNumber || `EXP-${data.category}`,
      description: `Expense (${data.category}): ${data.description}`,
      performedBy: currentUser.name,
      createdAt: now.toISOString(),
    };

    setExpenses((prev) => [newExpense, ...prev]);
    setLedgerEntries((prev) => [ledgerEntry, ...prev]);

    setWallets((prev) =>
      prev.map((w) => (w.id === wallet.id ? { ...w, currentBalance: balAfter, updatedAt: now.toISOString() } : w))
    );

    logAudit(
      'RECORDED_EXPENSE',
      'EXPENSE',
      expId,
      `Recorded ${data.category} expense UGX ${data.amount.toLocaleString()} paid from ${wallet.accountName}. Description: ${data.description}`,
      undefined,
      { amount: data.amount, category: data.category, wallet: wallet.accountName }
    );

    return { success: true };
  };

  /**
   * Submit Daily End-Of-Day Reconciliation
   */
  const submitReconciliation = (
    record: Omit<ReconciliationRecord, 'id' | 'reconciliationNumber' | 'createdAt'>
  ): { success: boolean; error?: string } => {
    const now = new Date();
    const recId = `rec-${Date.now()}`;
    const recNumber = `REC-${record.date.replace(/-/g, '')}-${record.branchName.slice(0, 3).toUpperCase()}`;

    const newRecord: ReconciliationRecord = {
      ...record,
      id: recId,
      reconciliationNumber: recNumber,
      createdAt: now.toISOString(),
    };

    setReconciliations((prev) => [newRecord, ...prev]);

    logAudit(
      'SUBMITTED_RECONCILIATION',
      'RECONCILIATION',
      recId,
      `Submitted EOD Reconciliation for ${record.date} (${record.branchName}). Status: ${record.status}. MTN Var: ${record.mtnVariance}, Airtel Var: ${record.airtelVariance}, Cash Var: ${record.cashVariance}`,
      undefined,
      {
        mtnVariance: record.mtnVariance,
        airtelVariance: record.airtelVariance,
        cashVariance: record.cashVariance,
        status: record.status,
      }
    );

    return { success: true };
  };

  /**
   * Approve Reconciliation and Lock period
   */
  const approveReconciliation = (recId: string, approvalNotes: string) => {
    setReconciliations((prev) =>
      prev.map((r) =>
        r.id === recId
          ? {
              ...r,
              status: 'LOCKED',
              approvedBy: currentUser.name,
              approvalNotes,
            }
          : r
      )
    );

    logAudit(
      'APPROVED_RECONCILIATION',
      'RECONCILIATION',
      recId,
      `Approved and locked reconciliation ${recId}. Notes: ${approvalNotes}`
    );
  };

  /**
   * Manual Balance Adjustment (for cash drawer audit discrepancy, SIM float audit fix)
   */
  const adjustWalletBalance = (walletId: string, adjustmentAmount: number, reason: string) => {
    const wallet = wallets.find((w) => w.id === walletId);
    if (!wallet) return;

    const now = new Date();
    const balBefore = wallet.currentBalance;
    const balAfter = balBefore + adjustmentAmount;

    const adjEntry: LedgerEntry = {
      id: `ledg-${Date.now()}-adj`,
      walletId: wallet.id,
      walletName: wallet.accountName,
      walletType: wallet.walletType,
      entryType: 'BALANCE_ADJUSTMENT',
      amount: adjustmentAmount,
      balanceBefore: balBefore,
      balanceAfter: balAfter,
      reference: `ADJ-${now.toISOString().slice(0, 10)}`,
      description: `Manual balance adjustment: ${reason}`,
      performedBy: currentUser.name,
      createdAt: now.toISOString(),
    };

    setLedgerEntries((prev) => [adjEntry, ...prev]);
    setWallets((prev) =>
      prev.map((w) => (w.id === walletId ? { ...w, currentBalance: balAfter, updatedAt: now.toISOString() } : w))
    );

    logAudit(
      'ADJUSTED_WALLET_BALANCE',
      'WALLET',
      walletId,
      `Adjusted ${wallet.accountName} by UGX ${adjustmentAmount.toLocaleString()}. Reason: ${reason}`,
      { balanceBefore: balBefore },
      { balanceAfter: balAfter }
    );
  };

  const updateWalletThreshold = (walletId: string, minThreshold: number) => {
    setWallets((prev) => prev.map((w) => (w.id === walletId ? { ...w, minimumThreshold: minThreshold } : w)));
    logAudit('UPDATED_WALLET_THRESHOLD', 'WALLET', walletId, `Updated minimum alert threshold to UGX ${minThreshold.toLocaleString()}`);
  };

  const addWallet = (walletData: Omit<Wallet, 'id' | 'currentBalance' | 'updatedAt'>) => {
    const newWallet: Wallet = {
      ...walletData,
      id: `wallet-${Date.now()}`,
      currentBalance: walletData.openingBalance,
      updatedAt: new Date().toISOString(),
    };
    setWallets((prev) => [...prev, newWallet]);
    logAudit('CREATED_WALLET', 'WALLET', newWallet.id, `Created new wallet: ${newWallet.accountName}`);
  };

  const saveCommissionRule = (rule: CommissionRule) => {
    setCommissionRules((prev) => {
      const idx = prev.findIndex((r) => r.id === rule.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = rule;
        return copy;
      }
      return [...prev, rule];
    });
    logAudit(
      'UPDATED_COMMISSION_RULE',
      'COMMISSION_RULE',
      rule.id,
      `Updated ${rule.provider} ${rule.transactionType} tier [${rule.minAmount.toLocaleString()} - ${rule.maxAmount.toLocaleString()}] to ${rule.commissionValue} (${rule.commissionType})`
    );
  };

  const deleteCommissionRule = (ruleId: string) => {
    setCommissionRules((prev) => prev.filter((r) => r.id !== ruleId));
    logAudit('DELETED_COMMISSION_RULE', 'COMMISSION_RULE', ruleId, `Deleted commission rule ${ruleId}`);
  };

  const resetToOfficialTariffs = () => {
    setCommissionRules(OFFICIAL_UGANDA_TARIFF_RULES);
    localStorage.setItem(`${STORAGE_KEY}_COMMISSIONS`, JSON.stringify(OFFICIAL_UGANDA_TARIFF_RULES));
    logAudit(
      'UPDATED_COMMISSION_RULE',
      'COMMISSION_RULE',
      'all',
      'Reset all commission rules and tariffs to official MTN and Airtel Uganda tariff rates.'
    );
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
    };
    setUsers((prev) => [...prev, newUser]);
    logAudit('CREATED_USER', 'AGENT', newUser.id, `Created agent/user: ${newUser.name} (${newUser.role})`);
  };

  const updateUser = (updatedUser: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    logAudit('UPDATED_USER', 'AGENT', updatedUser.id, `Updated details for ${updatedUser.name}`);
  };

  const resetAllData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_USERS`);
    localStorage.removeItem(`${STORAGE_KEY}_CURRENT_USER`);
    localStorage.removeItem(`${STORAGE_KEY}_WALLETS`);
    localStorage.removeItem(`${STORAGE_KEY}_LEDGER`);
    localStorage.removeItem(`${STORAGE_KEY}_TXS`);
    localStorage.removeItem(`${STORAGE_KEY}_COMMISSIONS`);
    localStorage.removeItem(`${STORAGE_KEY}_TRANSFERS`);
    localStorage.removeItem(`${STORAGE_KEY}_EXPENSES`);
    localStorage.removeItem(`${STORAGE_KEY}_RECON`);
    localStorage.removeItem(`${STORAGE_KEY}_AUDIT`);

    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setWallets(INITIAL_WALLETS);
    setLedgerEntries(INITIAL_LEDGER_ENTRIES);
    setTransactions(INITIAL_TRANSACTIONS);
    setCommissionRules(INITIAL_COMMISSION_RULES);
    setTransfers(INITIAL_TRANSFERS);
    setExpenses(INITIAL_EXPENSES);
    setReconciliations(INITIAL_RECONCILIATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setActiveBranchId('ALL');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        addUser,
        updateUser,
        branches,
        activeBranchId,
        setActiveBranchId,
        wallets,
        ledgerEntries,
        addWallet,
        updateWalletThreshold,
        adjustWalletBalance,
        getWalletBalanceFromLedger,
        transactions,
        recordTransaction,
        reverseTransaction,
        transfers,
        executeFloatTransfer,
        commissionRules,
        calculateCommission,
        getTariffBreakdown,
        saveCommissionRule,
        deleteCommissionRule,
        resetToOfficialTariffs,
        expenses,
        recordExpense,
        reconciliations,
        submitReconciliation,
        approveReconciliation,
        auditLogs,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
