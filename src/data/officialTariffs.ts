import { CommissionRule } from '../types';

export interface OfficialTariffTier {
  id: string;
  provider: 'MTN' | 'AIRTEL';
  type: 'WITHDRAWAL' | 'DEPOSIT' | 'AIRTIME' | 'SEND_P2P';
  minAmount: number;
  maxAmount: number;
  customerFee: number;
  govtTaxRate: number; // 0.005 for 0.5%
  agentCommission: number;
  isPercentageCommission?: boolean;
  description: string;
}

/**
 * Official MTN Mobile Money Tariffs from https://www.mtn.co.ug/tariffs/mobile-money-tariffs/
 * and Airtel Money Transaction Fees from https://www.airtel.co.ug/airtelmoney/transaction_fees
 */
export const OFFICIAL_UGANDA_TARIFF_RULES: CommissionRule[] = [
  // ==========================================
  // MTN UGANDA WITHDRAWAL (AGENT CASH OUT)
  // Source: https://www.mtn.co.ug/tariffs/mobile-money-tariffs/
  // ==========================================
  {
    id: 'cr-mtn-w-1',
    provider: 'MTN',
    transactionType: 'WITHDRAWAL',
    minAmount: 500,
    maxAmount: 2500,
    commissionType: 'FIXED',
    commissionValue: 150,
    customerFee: 330,
    govtTaxRate: 0.005,
    description: 'MTN 500 - 2,500 (Fee: 330 UGX)',
  },
  {
    id: 'cr-mtn-w-2',
    provider: 'MTN',
    transactionType: 'WITHDRAWAL',
    minAmount: 2501,
    maxAmount: 5000,
    commissionType: 'FIXED',
    commissionValue: 200,
    customerFee: 440,
    govtTaxRate: 0.005,
    description: 'MTN 2,501 - 5,000 (Fee: 440 UGX)',
  },
  {
    id: 'cr-mtn-w-3',
    provider: 'MTN',
    transactionType: 'WITHDRAWAL',
    minAmount: 5001,
    maxAmount: 15000,
    commissionType: 'FIXED',
    commissionValue: 350,
    customerFee: 700,
    govtTaxRate: 0.005,
    description: 'MTN 5,001 - 15,000 (Fee: 700 UGX)',
  },
  {
    id: 'cr-mtn-w-4',
    provider: 'MTN',
    transactionType: 'WITHDRAWAL',
    minAmount: 15001,
    maxAmount: 30000,
    commissionType: 'FIXED',
    commissionValue: 450,
    customerFee: 880,
    govtTaxRate: 0.005,
    description: 'MTN 15,001 - 30,000 (Fee: 880 UGX)',
  },
  {
    id: 'cr-mtn-w-5',
    provider: 'MTN',
    transactionType: 'WITHDRAWAL',
    minAmount: 30001,
    maxAmount: 45000,
    commissionType: 'FIXED',
    commissionValue: 600,
    customerFee: 1210,
    govtTaxRate: 0.005,
    description: 'MTN 30,001 - 45,000 (Fee: 1,210 UGX)',
  },
  {
    id: 'cr-mtn-w-6',
    provider: 'MTN',
    transactionType: 'WITHDRAWAL',
    minAmount: 45001,
    maxAmount: 60000,
    commissionType: 'FIXED',
    commissionValue: 750,
    customerFee: 1500,
    govtTaxRate: 0.005,
    description: 'MTN 45,001 - 60,000 (Fee: 1,500 UGX)',
  },
  {
    id: 'cr-mtn-w-7',
    provider: 'MTN',
    transactionType: 'WITHDRAWAL',
    minAmount: 60001,
    maxAmount: 125000,
    commissionType: 'FIXED',
    commissionValue: 1000,
    customerFee: 1925,
    govtTaxRate: 0.005,
    description: 'MTN 60,001 - 125,000 (Fee: 1,925 UGX)',
  },
  {
    id: 'cr-mtn-w-8',
    provider: 'MTN',
    transactionType: 'WITHDRAWAL',
    minAmount: 125001,
    maxAmount: 250000,
    commissionType: 'FIXED',
    commissionValue: 1800,
    customerFee: 3575,
    govtTaxRate: 0.005,
    description: 'MTN 125,001 - 250,000 (Fee: 3,575 UGX)',
  },
  {
    id: 'cr-mtn-w-9',
    provider: 'MTN',
    transactionType: 'WITHDRAWAL',
    minAmount: 250001,
    maxAmount: 500000,
    commissionType: 'FIXED',
    commissionValue: 3500,
    customerFee: 7000,
    govtTaxRate: 0.005,
    description: 'MTN 250,001 - 500,000 (Fee: 7,000 UGX)',
  },
  {
    id: 'cr-mtn-w-10',
    provider: 'MTN',
    transactionType: 'WITHDRAWAL',
    minAmount: 500001,
    maxAmount: 1000000,
    commissionType: 'FIXED',
    commissionValue: 6000,
    customerFee: 12500,
    govtTaxRate: 0.005,
    description: 'MTN 500,001 - 1,000,000 (Fee: 12,500 UGX)',
  },
  {
    id: 'cr-mtn-w-11',
    provider: 'MTN',
    transactionType: 'WITHDRAWAL',
    minAmount: 1000001,
    maxAmount: 2000000,
    commissionType: 'FIXED',
    commissionValue: 8000,
    customerFee: 15000,
    govtTaxRate: 0.005,
    description: 'MTN 1,000,001 - 2,000,000 (Fee: 15,000 UGX)',
  },
  {
    id: 'cr-mtn-w-12',
    provider: 'MTN',
    transactionType: 'WITHDRAWAL',
    minAmount: 2000001,
    maxAmount: 4000000,
    commissionType: 'FIXED',
    commissionValue: 10000,
    customerFee: 18000,
    govtTaxRate: 0.005,
    description: 'MTN 2,000,001 - 4,000,000 (Fee: 18,000 UGX)',
  },
  {
    id: 'cr-mtn-w-13',
    provider: 'MTN',
    transactionType: 'WITHDRAWAL',
    minAmount: 4000001,
    maxAmount: 5000000,
    commissionType: 'FIXED',
    commissionValue: 12500,
    customerFee: 20000,
    govtTaxRate: 0.005,
    description: 'MTN 4,000,001 - 5,000,000 (Fee: 20,000 UGX)',
  },
  {
    id: 'cr-mtn-w-14',
    provider: 'MTN',
    transactionType: 'WITHDRAWAL',
    minAmount: 5000001,
    maxAmount: 10000000,
    commissionType: 'FIXED',
    commissionValue: 15000,
    customerFee: 25000,
    govtTaxRate: 0.005,
    description: 'MTN 5,000,001 - 10,000,000 (Fee: 25,000 UGX)',
  },

  // ==========================================
  // MTN UGANDA DEPOSITS (FREE TO CUSTOMER)
  // ==========================================
  {
    id: 'cr-mtn-d-1',
    provider: 'MTN',
    transactionType: 'DEPOSIT',
    minAmount: 500,
    maxAmount: 50000,
    commissionType: 'FIXED',
    commissionValue: 200,
    customerFee: 0,
    govtTaxRate: 0,
    description: 'MTN Cash In 500 - 50k (Free to Customer)',
  },
  {
    id: 'cr-mtn-d-2',
    provider: 'MTN',
    transactionType: 'DEPOSIT',
    minAmount: 50001,
    maxAmount: 100000,
    commissionType: 'FIXED',
    commissionValue: 400,
    customerFee: 0,
    govtTaxRate: 0,
    description: 'MTN Cash In 50k - 100k (Free to Customer)',
  },
  {
    id: 'cr-mtn-d-3',
    provider: 'MTN',
    transactionType: 'DEPOSIT',
    minAmount: 100001,
    maxAmount: 500000,
    commissionType: 'FIXED',
    commissionValue: 800,
    customerFee: 0,
    govtTaxRate: 0,
    description: 'MTN Cash In 100k - 500k (Free to Customer)',
  },
  {
    id: 'cr-mtn-d-4',
    provider: 'MTN',
    transactionType: 'DEPOSIT',
    minAmount: 500001,
    maxAmount: 1000000,
    commissionType: 'FIXED',
    commissionValue: 1500,
    customerFee: 0,
    govtTaxRate: 0,
    description: 'MTN Cash In 500k - 1M (Free to Customer)',
  },
  {
    id: 'cr-mtn-d-5',
    provider: 'MTN',
    transactionType: 'DEPOSIT',
    minAmount: 1000001,
    maxAmount: 5000000,
    commissionType: 'FIXED',
    commissionValue: 2500,
    customerFee: 0,
    govtTaxRate: 0,
    description: 'MTN Cash In 1M - 5M (Free to Customer)',
  },
  {
    id: 'cr-mtn-d-6',
    provider: 'MTN',
    transactionType: 'DEPOSIT',
    minAmount: 5000001,
    maxAmount: 10000000,
    commissionType: 'FIXED',
    commissionValue: 4000,
    customerFee: 0,
    govtTaxRate: 0,
    description: 'MTN Cash In 5M - 10M (Free to Customer)',
  },

  // ==========================================
  // AIRTEL UGANDA WITHDRAWAL (AGENT CASH OUT)
  // Source: https://www.airtel.co.ug/airtelmoney/transaction_fees
  // ==========================================
  {
    id: 'cr-art-w-1',
    provider: 'AIRTEL',
    transactionType: 'WITHDRAWAL',
    minAmount: 500,
    maxAmount: 2500,
    commissionType: 'FIXED',
    commissionValue: 150,
    customerFee: 330,
    govtTaxRate: 0.005,
    description: 'Airtel 500 - 2,500 (Fee: 330 UGX)',
  },
  {
    id: 'cr-art-w-2',
    provider: 'AIRTEL',
    transactionType: 'WITHDRAWAL',
    minAmount: 2501,
    maxAmount: 5000,
    commissionType: 'FIXED',
    commissionValue: 200,
    customerFee: 440,
    govtTaxRate: 0.005,
    description: 'Airtel 2,501 - 5,000 (Fee: 440 UGX)',
  },
  {
    id: 'cr-art-w-3',
    provider: 'AIRTEL',
    transactionType: 'WITHDRAWAL',
    minAmount: 5001,
    maxAmount: 15000,
    commissionType: 'FIXED',
    commissionValue: 350,
    customerFee: 700,
    govtTaxRate: 0.005,
    description: 'Airtel 5,001 - 15,000 (Fee: 700 UGX)',
  },
  {
    id: 'cr-art-w-4',
    provider: 'AIRTEL',
    transactionType: 'WITHDRAWAL',
    minAmount: 15001,
    maxAmount: 30000,
    commissionType: 'FIXED',
    commissionValue: 450,
    customerFee: 880,
    govtTaxRate: 0.005,
    description: 'Airtel 15,001 - 30,000 (Fee: 880 UGX)',
  },
  {
    id: 'cr-art-w-5',
    provider: 'AIRTEL',
    transactionType: 'WITHDRAWAL',
    minAmount: 30001,
    maxAmount: 45000,
    commissionType: 'FIXED',
    commissionValue: 600,
    customerFee: 1210,
    govtTaxRate: 0.005,
    description: 'Airtel 30,001 - 45,000 (Fee: 1,210 UGX)',
  },
  {
    id: 'cr-art-w-6',
    provider: 'AIRTEL',
    transactionType: 'WITHDRAWAL',
    minAmount: 45001,
    maxAmount: 60000,
    commissionType: 'FIXED',
    commissionValue: 750,
    customerFee: 1500,
    govtTaxRate: 0.005,
    description: 'Airtel 45,001 - 60,000 (Fee: 1,500 UGX)',
  },
  {
    id: 'cr-art-w-7',
    provider: 'AIRTEL',
    transactionType: 'WITHDRAWAL',
    minAmount: 60001,
    maxAmount: 125000,
    commissionType: 'FIXED',
    commissionValue: 1000,
    customerFee: 1925,
    govtTaxRate: 0.005,
    description: 'Airtel 60,001 - 125,000 (Fee: 1,925 UGX)',
  },
  {
    id: 'cr-art-w-8',
    provider: 'AIRTEL',
    transactionType: 'WITHDRAWAL',
    minAmount: 125001,
    maxAmount: 250000,
    commissionType: 'FIXED',
    commissionValue: 1800,
    customerFee: 3575,
    govtTaxRate: 0.005,
    description: 'Airtel 125,001 - 250,000 (Fee: 3,575 UGX)',
  },
  {
    id: 'cr-art-w-9',
    provider: 'AIRTEL',
    transactionType: 'WITHDRAWAL',
    minAmount: 250001,
    maxAmount: 500000,
    commissionType: 'FIXED',
    commissionValue: 3500,
    customerFee: 7000,
    govtTaxRate: 0.005,
    description: 'Airtel 250,001 - 500,000 (Fee: 7,000 UGX)',
  },
  {
    id: 'cr-art-w-10',
    provider: 'AIRTEL',
    transactionType: 'WITHDRAWAL',
    minAmount: 500001,
    maxAmount: 1000000,
    commissionType: 'FIXED',
    commissionValue: 6000,
    customerFee: 12500,
    govtTaxRate: 0.005,
    description: 'Airtel 500,001 - 1,000,000 (Fee: 12,500 UGX)',
  },
  {
    id: 'cr-art-w-11',
    provider: 'AIRTEL',
    transactionType: 'WITHDRAWAL',
    minAmount: 1000001,
    maxAmount: 2000000,
    commissionType: 'FIXED',
    commissionValue: 8000,
    customerFee: 15000,
    govtTaxRate: 0.005,
    description: 'Airtel 1,000,001 - 2,000,000 (Fee: 15,000 UGX)',
  },
  {
    id: 'cr-art-w-12',
    provider: 'AIRTEL',
    transactionType: 'WITHDRAWAL',
    minAmount: 2000001,
    maxAmount: 4000000,
    commissionType: 'FIXED',
    commissionValue: 10000,
    customerFee: 18000,
    govtTaxRate: 0.005,
    description: 'Airtel 2,000,001 - 4,000,000 (Fee: 18,000 UGX)',
  },
  {
    id: 'cr-art-w-13',
    provider: 'AIRTEL',
    transactionType: 'WITHDRAWAL',
    minAmount: 4000001,
    maxAmount: 5000000,
    commissionType: 'FIXED',
    commissionValue: 12500,
    customerFee: 20000,
    govtTaxRate: 0.005,
    description: 'Airtel 4,000,001 - 5,000,000 (Fee: 20,000 UGX)',
  },
  {
    id: 'cr-art-w-14',
    provider: 'AIRTEL',
    transactionType: 'WITHDRAWAL',
    minAmount: 5000001,
    maxAmount: 10000000,
    commissionType: 'FIXED',
    commissionValue: 15000,
    customerFee: 25000,
    govtTaxRate: 0.005,
    description: 'Airtel 5,000,001 - 10,000,000 (Fee: 25,000 UGX)',
  },

  // ==========================================
  // AIRTEL UGANDA DEPOSITS (FREE TO CUSTOMER)
  // ==========================================
  {
    id: 'cr-art-d-1',
    provider: 'AIRTEL',
    transactionType: 'DEPOSIT',
    minAmount: 500,
    maxAmount: 50000,
    commissionType: 'FIXED',
    commissionValue: 220,
    customerFee: 0,
    govtTaxRate: 0,
    description: 'Airtel Cash In 500 - 50k (Free to Customer)',
  },
  {
    id: 'cr-art-d-2',
    provider: 'AIRTEL',
    transactionType: 'DEPOSIT',
    minAmount: 50001,
    maxAmount: 100000,
    commissionType: 'FIXED',
    commissionValue: 450,
    customerFee: 0,
    govtTaxRate: 0,
    description: 'Airtel Cash In 50k - 100k (Free to Customer)',
  },
  {
    id: 'cr-art-d-3',
    provider: 'AIRTEL',
    transactionType: 'DEPOSIT',
    minAmount: 100001,
    maxAmount: 500000,
    commissionType: 'FIXED',
    commissionValue: 850,
    customerFee: 0,
    govtTaxRate: 0,
    description: 'Airtel Cash In 100k - 500k (Free to Customer)',
  },
  {
    id: 'cr-art-d-4',
    provider: 'AIRTEL',
    transactionType: 'DEPOSIT',
    minAmount: 500001,
    maxAmount: 1000000,
    commissionType: 'FIXED',
    commissionValue: 1800,
    customerFee: 0,
    govtTaxRate: 0,
    description: 'Airtel Cash In 500k - 1M (Free to Customer)',
  },
  {
    id: 'cr-art-d-5',
    provider: 'AIRTEL',
    transactionType: 'DEPOSIT',
    minAmount: 1000001,
    maxAmount: 5000000,
    commissionType: 'FIXED',
    commissionValue: 3000,
    customerFee: 0,
    govtTaxRate: 0,
    description: 'Airtel Cash In 1M - 5M (Free to Customer)',
  },
  {
    id: 'cr-art-d-6',
    provider: 'AIRTEL',
    transactionType: 'DEPOSIT',
    minAmount: 5000001,
    maxAmount: 10000000,
    commissionType: 'FIXED',
    commissionValue: 4500,
    customerFee: 0,
    govtTaxRate: 0,
    description: 'Airtel Cash In 5M - 10M (Free to Customer)',
  },

  // ==========================================
  // AIRTIME LOADING (STANDARD 4% AGENT REBATE)
  // ==========================================
  {
    id: 'cr-mtn-airtime-1',
    provider: 'MTN',
    transactionType: 'AIRTIME',
    minAmount: 500,
    maxAmount: 10000000,
    commissionType: 'PERCENTAGE',
    commissionValue: 4,
    customerFee: 0,
    govtTaxRate: 0,
    description: 'MTN EasyCharge Airtime 4% Agent Commission',
  },
  {
    id: 'cr-art-airtime-1',
    provider: 'AIRTEL',
    transactionType: 'AIRTIME',
    minAmount: 500,
    maxAmount: 10000000,
    commissionType: 'PERCENTAGE',
    commissionValue: 4,
    customerFee: 0,
    govtTaxRate: 0,
    description: 'Airtel EasyLoad Airtime 4% Agent Commission',
  },
];

export const OFFICIAL_TARIFF_SOURCES = {
  MTN: {
    name: 'MTN Uganda Mobile Money Tariffs',
    url: 'https://www.mtn.co.ug/tariffs/mobile-money-tariffs/',
    taxNote: '0.5% Government excise duty applied on cash withdrawal amounts automatically.',
  },
  AIRTEL: {
    name: 'Airtel Uganda Money Transaction Fees',
    url: 'https://www.airtel.co.ug/airtelmoney/transaction_fees',
    taxNote: '0.5% Government excise duty applied on cash withdrawal amounts automatically.',
  },
};

export interface TariffBreakdown {
  provider: 'MTN' | 'AIRTEL';
  type: 'WITHDRAWAL' | 'DEPOSIT' | 'AIRTIME' | 'BILL_PAY' | 'MERCHANT_PAY';
  amount: number;
  customerFee: number;
  govtTax: number;
  totalCustomerCost: number;
  agentCommission: number;
  matchingRule?: CommissionRule;
  sourceUrl: string;
}

export function computeTariffBreakdown(
  provider: 'MTN' | 'AIRTEL',
  type: 'WITHDRAWAL' | 'DEPOSIT' | 'AIRTIME' | 'BILL_PAY' | 'MERCHANT_PAY',
  amount: number,
  rules: CommissionRule[] = OFFICIAL_UGANDA_TARIFF_RULES
): TariffBreakdown {
  const matchingRule = rules.find(
    (r) => r.provider === provider && r.transactionType === type && amount >= r.minAmount && amount <= r.maxAmount
  );

  let agentCommission = 0;
  let customerFee = 0;
  let govtTax = 0;

  if (matchingRule) {
    if (matchingRule.commissionType === 'FIXED') {
      agentCommission = matchingRule.commissionValue;
    } else {
      agentCommission = Math.round((amount * matchingRule.commissionValue) / 100);
    }
    customerFee = matchingRule.customerFee || 0;
    const taxRate = matchingRule.govtTaxRate ?? (type === 'WITHDRAWAL' ? 0.005 : 0);
    govtTax = Math.round(amount * taxRate);
  } else {
    // Standard fallbacks if outside range
    if (type === 'WITHDRAWAL') {
      agentCommission = Math.max(100, Math.round(amount * 0.007));
      customerFee = Math.max(330, Math.round(amount * 0.01));
      govtTax = Math.round(amount * 0.005);
    } else if (type === 'DEPOSIT') {
      agentCommission = Math.max(100, Math.round(amount * 0.003));
      customerFee = 0;
      govtTax = 0;
    } else if (type === 'AIRTIME') {
      agentCommission = Math.max(50, Math.round(amount * 0.04));
      customerFee = 0;
      govtTax = 0;
    }
  }

  // Total amount deducted from customer account
  // For withdrawal: principal + customerFee + govtTax
  // For deposit: customer gives cash equal to deposit amount (free deposit)
  // For airtime: customer gives cash equal to airtime face value (fee = 0)
  const totalCustomerCost = type === 'WITHDRAWAL' ? amount + customerFee + govtTax : amount;

  return {
    provider,
    type,
    amount,
    customerFee,
    govtTax,
    totalCustomerCost,
    agentCommission,
    matchingRule,
    sourceUrl: OFFICIAL_TARIFF_SOURCES[provider].url,
  };
}

