import { Provider, TransactionType } from '../types';
import { detectProviderFromPhone } from './formatters';

export interface ParsedSMSResult {
  success: boolean;
  provider?: Provider;
  type?: TransactionType;
  amount?: number;
  phone?: string;
  customerName?: string;
  reference?: string;
  error?: string;
  rawText: string;
}

export function parseMobileMoneySMS(rawText: string): ParsedSMSResult {
  if (!rawText || !rawText.trim()) {
    return { success: false, error: 'SMS text is empty', rawText };
  }

  const text = rawText.trim();
  const lower = text.toLowerCase();

  let provider: Provider | undefined;
  let type: TransactionType | undefined;
  let amount: number | undefined;
  let phone: string | undefined;
  let customerName: string | undefined;
  let reference: string | undefined;

  // 1. Detect Provider
  if (lower.includes("y'ello") || lower.includes('mtn') || lower.includes('momo') || lower.includes('financial transaction id')) {
    provider = 'MTN';
  } else if (lower.includes('airtel') || lower.includes('trans id: am') || lower.includes('airtel money')) {
    provider = 'AIRTEL';
  }

  // 2. Detect Type (Deposit / Cash In vs Withdrawal / Cash Out vs Airtime)
  if (
    lower.includes('airtime') ||
    lower.includes('easyload') ||
    lower.includes('airtime recharge') ||
    lower.includes('loaded airtime') ||
    lower.includes('bought airtime')
  ) {
    type = 'AIRTIME';
  } else if (
    lower.includes('sent to') ||
    lower.includes('cash in') ||
    lower.includes('transfer of ugx') ||
    lower.includes('transferred to')
  ) {
    type = 'DEPOSIT';
  } else if (
    lower.includes('received') ||
    lower.includes('cash out') ||
    lower.includes('withdrawn') ||
    lower.includes('payment received')
  ) {
    type = 'WITHDRAWAL';
  }

  // 3. Extract Amount
  // Matches "UGX 500,000", "UGX 500000", "UGX. 100,000", "Shs 50,000"
  const amountMatch = text.match(/(?:UGX|Shs|Shs\.|UGX\.)\s*([\d,]+)/i);
  if (amountMatch && amountMatch[1]) {
    const cleanNum = amountMatch[1].replace(/,/g, '');
    const parsed = parseInt(cleanNum, 10);
    if (!isNaN(parsed)) {
      amount = parsed;
    }
  }

  // 4. Extract Phone Number
  // Matches "2567XXXXXXXX", "07XXXXXXXX"
  const phoneMatch = text.match(/(?:256|0)(7\d{8})/);
  if (phoneMatch) {
    const fullMatch = phoneMatch[0];
    phone = fullMatch.startsWith('256') ? '0' + fullMatch.slice(3) : fullMatch;
    if (!provider) {
      provider = detectProviderFromPhone(phone) || 'MTN';
    }
  }

  // 5. Extract Reference ID
  // e.g. "Transaction Id: 18492049281", "Trans ID: AM9284019283", "Financial Transaction Id: 98127391823", "Ref: 918239"
  const refMatch = text.match(/(?:transaction id|financial transaction id|trans id|tx id|ref(?:erence)?|id)[:\s]+([A-Za-z0-9.]+)/i);
  if (refMatch && refMatch[1]) {
    reference = refMatch[1];
  }

  // 6. Extract Customer Name (if present before or after phone number)
  // e.g. "sent to 256782114477 Babirye Juliet on"
  const namePattern1 = /(?:to|from)\s+(?:256|0)\d{9}\s+([A-Za-z\s]+?)(?=\s+(?:on|with|trans|ref|\.|\,|$))/i;
  const nameMatch1 = text.match(namePattern1);
  if (nameMatch1 && nameMatch1[1] && nameMatch1[1].trim().length > 2) {
    customerName = nameMatch1[1].trim();
  }

  if (!provider) {
    provider = 'MTN'; // fallback
  }

  if (!type) {
    type = 'DEPOSIT'; // fallback
  }

  return {
    success: !!amount,
    provider,
    type,
    amount,
    phone: phone || '',
    customerName: customerName || '',
    reference: reference || `SMS-REF-${Math.floor(100000 + Math.random() * 900000)}`,
    rawText,
    error: !amount ? 'Could not extract transaction amount from message' : undefined,
  };
}

export const SAMPLE_SMS_MESSAGES = [
  {
    label: "MTN Cash In (Deposit) - UGX 250,000",
    sms: "Y'ello. UGX 250,000 sent to 256782114477 Babirye Juliet on 2026-10-02 14:15:30. Transaction Id: 19482019482. New balance: UGX 5,900,000."
  },
  {
    label: "MTN Cash Out (Withdrawal) - UGX 100,000",
    sms: "Y'ello. You have received UGX 100,000 from 256772458912 Kavuma David. Financial Transaction Id: 99182736152. New balance: UGX 4,750,000."
  },
  {
    label: "Airtel Cash In (Deposit) - UGX 180,000",
    sms: "Cash In of UGX 180,000 to 256701889922 Opolot Emmanuel was successful. Trans ID: AM9918204918. Your Airtel Money balance is UGX 4,280,000."
  },
  {
    label: "Airtel Cash Out (Withdrawal) - UGX 50,000",
    sms: "You have received UGX 50,000 from 256754223399 Achieng Brenda. Trans ID: AM8837192031. Your balance is UGX 3,750,000."
  },
  {
    label: "MTN Load Airtime - UGX 10,000",
    sms: "Y'ello. You have loaded UGX 10,000 airtime to 256772123456 Mukasa Brian on 2026-10-02 15:20:00. Trans ID: 88192039182. New float balance: UGX 5,640,000."
  },
  {
    label: "Airtel Load Airtime - UGX 5,000",
    sms: "You have successfully sold airtime of UGX 5,000 to 256701998877 Namubiru Sarah. Trans ID: AM7718290192. Airtel Money balance is UGX 4,095,000."
  }
];
