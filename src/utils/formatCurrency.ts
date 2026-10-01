import { CurrencyConfig } from '../types';

/**
 * Normalizes currency symbols to avoid weird Unicode glyphs like U+20A8 (₨).
 * "Rs." looks vastly cleaner, professional, and standard across all operating systems.
 */
export function cleanCurrencySymbol(symbolOrConfig?: string | CurrencyConfig): string {
  if (!symbolOrConfig) return 'Rs.';
  const sym = typeof symbolOrConfig === 'string' ? symbolOrConfig : symbolOrConfig.symbol;
  if (!sym || sym === '₨') {
    return 'Rs.';
  }
  return sym;
}

/**
 * Formats an amount with clean currency symbol and thousands separators.
 * Includes a clean, proportional space after multi-letter symbols like "Rs." so it never looks squished.
 * e.g. formatMoney(15000, 'Rs.') -> "Rs. 15,000"
 * e.g. formatMoney(150, '$') -> "$150"
 */
export function formatMoney(
  amount: number,
  currencyOrSymbol: string | CurrencyConfig = 'Rs.',
  decimals: number = 0
): string {
  const sym = cleanCurrencySymbol(currencyOrSymbol);
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;

  const formattedNum = decimals > 0
    ? num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(num).toLocaleString('en-US');

  // Multi-character symbols like "Rs.", "RM", "A$", "C$" look much cleaner with a space
  const needsSpace = sym.length > 1 || sym.endsWith('.');
  const separator = needsSpace ? ' ' : '';

  return `${sym}${separator}${formattedNum}`;
}
