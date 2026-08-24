/**
 * Approximate exchange rates, used only to compare costs on a common scale.
 * These are indicative, not live rates — update them here when they drift.
 *
 * rate = how many US dollars one unit is worth.
 */
export const RATES_TO_USD = {
  USD: 1,      EUR: 1.08,   GBP: 1.27,   CHF: 1.13,
  CAD: 0.73,   AUD: 0.66,   NZD: 0.61,
  SEK: 0.095,  DKK: 0.145,  NOK: 0.093,
  PLN: 0.25,   CZK: 0.043,  HUF: 0.0027, TRY: 0.030,
  SGD: 0.74,   HKD: 0.128,  JPY: 0.0067, CNY: 0.138,
  KRW: 0.00073, TWD: 0.031, INR: 0.012,
  AED: 0.272,  ILS: 0.27,   BRL: 0.185,  MXN: 0.055,  ZAR: 0.054
};

export const RATES_UPDATED = 'Indicative rates, mid-2025';

/** Convert an amount from one currency to another. */
export function convert(amount, from, to = 'USD') {
  if (amount == null || Number.isNaN(amount)) return null;
  const fromRate = RATES_TO_USD[from];
  const toRate = RATES_TO_USD[to];
  if (!fromRate || !toRate) return null;
  return (amount * fromRate) / toRate;
}

export const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', CHF: 'CHF', CAD: 'C$', AUD: 'A$', NZD: 'NZ$',
  SEK: 'kr', DKK: 'kr', NOK: 'kr', PLN: 'zł', CZK: 'Kč', HUF: 'Ft', TRY: '₺',
  SGD: 'S$', HKD: 'HK$', JPY: '¥', CNY: '¥', KRW: '₩', TWD: 'NT$', INR: '₹',
  AED: 'AED', ILS: '₪', BRL: 'R$', MXN: 'MX$', ZAR: 'R'
};
