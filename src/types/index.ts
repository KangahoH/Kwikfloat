export type Provider = 'MTN' | 'AIRTEL';

export type WalletType = 'CASH' | 'MTN_FLOAT' | 'AIRTEL_FLOAT' | 'BANK';

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'AIRTIME' | 'BILL_PAY' | 'MERCHANT_PAY';

export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'REVERSED' | 'FAILED';

export type UserRole = 'OWNER' | 'MANAGER' | 'AGENT' | 'AUDITOR';

export type ExpenseCategory =
  | 'RENT'
  | 'ELECTRICITY'
  | 'INTERNET'
  | 'SALARIES'
  | 'TRANSPORT'
  | 'AIRTIME_FEES'
  | 'SECURITY'
  | 'REPAIRS'
  | 'MISCELLANEOUS';

export interface Branch {
  id: string;
  name: string;
  location: string;
  code: string;
  status: 'ACTIVE' | 'INACTIVE';
  managerName: string;
  phone: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  nationalId?: string;
  branchId: string;
  branchName: string;
  username: string;
  role: UserRole;
  avatar?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  assignedCashLimit: number;
  assignedMtnLimit: number;
  assignedAirtelLimit: number;
}

export interface Wallet {
  id: string;
  branchId: string;
  branchName: string;
  agentId?: string | null;
  walletType: WalletType;
  provider: Provider | 'CASH' | 'BANK';
  accountName: string;
  simNumberOrRef: string;
  openingBalance: number;
  currentBalance: number;
  minimumThreshold: number;
  updatedAt: string;
}

export interface LedgerEntry {
  id: string;
  walletId: string;
  walletName: string;
  walletType: WalletType;
  transactionId?: string;
  transferId?: string;
  expenseId?: string;
  entryType:
    | 'CUSTOMER_DEPOSIT'
    | 'CUSTOMER_WITHDRAWAL'
    | 'CUSTOMER_AIRTIME'
    | 'FLOAT_TRANSFER_IN'
    | 'FLOAT_TRANSFER_OUT'
    | 'EXPENSE_PAYMENT'
    | 'FLOAT_TOPUP'
    | 'COMMISSION_CREDIT'
    | 'BALANCE_ADJUSTMENT'
    | 'REVERSAL';
  amount: number; // positive or negative
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
  description: string;
  performedBy: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  transactionNumber: string;
  provider: Provider;
  type: TransactionType;
  amount: number;
  customerPhone: string;
  customerName?: string;
  agentId: string;
  agentName: string;
  branchId: string;
  branchName: string;
  commission: number;
  providerReference: string;
  status: TransactionStatus;
  transactionDate: string;
  notes?: string;
  smsRawText?: string;
  reversalReason?: string;
  reversedAt?: string;
  reversedBy?: string;
}

export interface WalletTransfer {
  id: string;
  transferNumber: string;
  sourceWalletId: string;
  sourceWalletName: string;
  destinationWalletId: string;
  destinationWalletName: string;
  amount: number;
  fee: number;
  reference: string;
  reason: string;
  branchId: string;
  createdBy: string;
  createdAt: string;
}

export interface CommissionRule {
  id: string;
  provider: Provider;
  transactionType: TransactionType;
  minAmount: number;
  maxAmount: number;
  commissionType: 'FIXED' | 'PERCENTAGE';
  commissionValue: number;
  customerFee?: number;
  govtTaxRate?: number;
  description: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  paymentWalletId: string;
  paymentWalletName: string;
  branchId: string;
  branchName: string;
  description: string;
  receiptNumber?: string;
  recordedBy: string;
  expenseDate: string;
  createdAt: string;
}

export interface ReconciliationRecord {
  id: string;
  reconciliationNumber: string;
  date: string; // YYYY-MM-DD
  branchId: string;
  branchName: string;
  agentId?: string;
  agentName?: string;
  // MTN Float
  mtnOpening: number;
  mtnDeposits: number;
  mtnWithdrawals: number;
  mtnTransfers: number;
  mtnExpected: number;
  mtnActual: number;
  mtnVariance: number;
  mtnVarianceReason?: string;
  // Airtel Float
  airtelOpening: number;
  airtelDeposits: number;
  airtelWithdrawals: number;
  airtelTransfers: number;
  airtelExpected: number;
  airtelActual: number;
  airtelVariance: number;
  airtelVarianceReason?: string;
  // Cash
  cashOpening: number;
  cashWithdrawals: number;
  cashDeposits: number;
  cashExpenses: number;
  cashTransfers: number;
  cashExpected: number;
  cashActual: number;
  cashVariance: number;
  cashVarianceReason?: string;
  // Cash denomination counts
  cashDenominations?: {
    c50000: number;
    c20000: number;
    c10000: number;
    c5000: number;
    c2000: number;
    c1000: number;
    c500: number;
    c200: number;
    c100: number;
  };
  status: 'BALANCED' | 'VARIANCE_PENDING' | 'VARIANCE_APPROVED' | 'LOCKED';
  reconciledBy: string;
  approvedBy?: string;
  approvalNotes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType:
    | 'TRANSACTION'
    | 'WALLET'
    | 'EXPENSE'
    | 'RECONCILIATION'
    | 'COMMISSION_RULE'
    | 'FLOAT_TRANSFER'
    | 'AGENT'
    | 'SETTINGS';
  entityId: string;
  details: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  timestamp: string;
}
