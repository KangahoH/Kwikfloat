import { Provider, TransactionType } from '../types';

/**
 * Format numbers as Ugandan Shillings (UGX)
 */
export function formatUGX(amount: number | undefined | null, showSymbol = true): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return showSymbol ? 'UGX 0' : '0';
  }
  const formatted = Math.round(amount).toLocaleString('en-US');
  return showSymbol ? `UGX ${formatted}` : formatted;
}

/**
 * Compact UGX format for dashboards (e.g. 5.5M, 120K)
 */
export function formatCompactUGX(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K`;
  }
  return formatUGX(amount, false);
}

/**
 * Auto-detect Uganda telecom provider based on phone number prefix
 */
export function detectProviderFromPhone(phone: string): Provider | null {
  const cleaned = phone.replace(/[^0-9]/g, '');

  // Standardize 2567... or 07...
  let localPrefix = '';
  if (cleaned.startsWith('256')) {
    localPrefix = cleaned.slice(3, 5); // e.g. '77', '78', '70'
  } else if (cleaned.startsWith('0')) {
    localPrefix = cleaned.slice(1, 3); // e.g. '77', '78', '70'
  } else {
    localPrefix = cleaned.slice(0, 2);
  }

  // MTN: 77, 78, 76, 39
  if (['77', '78', '76', '39'].includes(localPrefix)) {
    return 'MTN';
  }

  // Airtel: 70, 75, 74
  if (['70', '75', '74'].includes(localPrefix)) {
    return 'AIRTEL';
  }

  return null;
}

/**
 * Format phone number to clean Ugandan readable format (07XX XXX XXX)
 */
export function formatUgandanPhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('256') && cleaned.length >= 12) {
    const local = '0' + cleaned.slice(3);
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7, 10)}`;
  }
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)}`;
  }
  return phone;
}

/**
 * Format date string to readable Uganda time
 */
export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

export function formatDateOnly(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}
