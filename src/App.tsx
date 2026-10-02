import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { WalletsLedgerView } from './components/WalletsLedgerView';
import { TransfersView } from './components/TransfersView';
import { ReconciliationView } from './components/ReconciliationView';
import { CommissionsView } from './components/CommissionsView';
import { ExpensesView } from './components/ExpensesView';
import { AgentsView } from './components/AgentsView';
import { ReportsView } from './components/ReportsView';
import { AuditTrailView } from './components/AuditTrailView';

import { NewTransactionModal } from './components/NewTransactionModal';
import { TransferModal } from './components/TransferModal';
import { ExpenseModal } from './components/ExpenseModal';
import { ReconciliationWizardModal } from './components/ReconciliationWizardModal';
import { ReceiptModal } from './components/ReceiptModal';
import { Transaction, TransactionType } from './types';

function AppContent() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Modals state
  const [isNewTxOpen, setIsNewTxOpen] = useState(false);
  const [initialTxType, setInitialTxType] = useState<TransactionType>('WITHDRAWAL');
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isReconOpen, setIsReconOpen] = useState(false);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);

  const handleOpenNewTx = (type: TransactionType = 'WITHDRAWAL') => {
    setInitialTxType(type);
    setIsNewTxOpen(true);
  };

  const handleTransactionSuccess = (tx: Transaction) => {
    setReceiptTx(tx);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navigation */}
      <Navbar
        onOpenNewTx={(type) => handleOpenNewTx(type || 'WITHDRAWAL')}
        onOpenTransfer={() => setIsTransferOpen(true)}
        onOpenRecon={() => setIsReconOpen(true)}
        onOpenExpense={() => setIsExpenseOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenNewTx={handleOpenNewTx}
              onOpenTransfer={() => setIsTransferOpen(true)}
              onOpenRecon={() => setIsReconOpen(true)}
              onOpenExpense={() => setIsExpenseOpen(true)}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              onOpenNewTx={() => handleOpenNewTx('WITHDRAWAL')}
              onOpenReceipt={(tx) => setReceiptTx(tx)}
            />
          )}

          {activeTab === 'ledger' && (
            <WalletsLedgerView onOpenTransfer={() => setIsTransferOpen(true)} />
          )}

          {activeTab === 'transfers' && (
            <TransfersView onOpenTransfer={() => setIsTransferOpen(true)} />
          )}

          {activeTab === 'reconciliation' && (
            <ReconciliationView onOpenRecon={() => setIsReconOpen(true)} />
          )}

          {activeTab === 'commissions' && <CommissionsView />}

          {activeTab === 'expenses' && (
            <ExpensesView onOpenExpense={() => setIsExpenseOpen(true)} />
          )}

          {activeTab === 'agents' && <AgentsView />}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'audit' && <AuditTrailView />}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <NewTransactionModal
        isOpen={isNewTxOpen}
        onClose={() => setIsNewTxOpen(false)}
        initialType={initialTxType}
        onTransactionSuccess={handleTransactionSuccess}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
      />

      <ExpenseModal
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
      />

      <ReconciliationWizardModal
        isOpen={isReconOpen}
        onClose={() => setIsReconOpen(false)}
      />

      <ReceiptModal
        transaction={receiptTx}
        onClose={() => setReceiptTx(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
