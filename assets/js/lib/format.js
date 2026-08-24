/** Display formatting helpers. */
import { CURRENCY_SYMBOLS, convert } from '../../../data/reference/currencies.js';

export { convert };

/** 62396 -> "$62,396" ; compact: "$62.4k" */
export function money(amount, currency = 'USD', { compact = false, decimals = 0 } = {}) {
  if (amount == null || Number.isNaN(amount)) return '—';
  const symbol = CURRENCY_SYMBOLS[currency] || currency + ' ';
  const sep = symbol.length > 2 ? ' ' : '';
  if (amount === 0) return `${symbol}${sep}0`;

  if (compact && Math.abs(amount) >= 1000) {
    const millions = Math.abs(amount) >= 1_000_000;
    const value = millions ? amount / 1_000_000 : amount / 1000;
    const suffix = millions ? 'M' : 'k';
    const shown = value >= 100 ? Math.round(value) : Number(value.toFixed(1));
    return `${symbol}${sep}${shown}${suffix}`;
  }
  return `${symbol}${sep}${Math.round(amount).toLocaleString('en-US', { maximumFractionDigits: decimals })}`;
}

/** 0.043 -> "4.3%" */
export function percent(fraction, decimals = null) {
  if (fraction == null || Number.isNaN(fraction)) return '—';
  const pct = fraction * 100;
  const d = decimals != null ? decimals : (pct < 10 ? 1 : 0);
  return `${pct.toFixed(d)}%`;
}

export function number(value) {
  if (value == null || Number.isNaN(value)) return '—';
  return Math.round(value).toLocaleString('en-US');
}

/** 47000 -> "47,000" ; compact "47k" */
export function compactNumber(value) {
  if (value == null || Number.isNaN(value)) return '—';
  if (value >= 1_000_000) return `${Number((value / 1_000_000).toFixed(1))}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return String(Math.round(value));
}

export function ordinal(n) {
  if (n == null) return '—';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function pluralise(count, singular, plural = singular + 's') {
  return `${number(count)} ${count === 1 ? singular : plural}`;
}

/** Escape a string for safe insertion into HTML. */
export function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
