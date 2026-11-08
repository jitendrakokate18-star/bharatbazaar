import type { Locale } from '../types/index.ts';

const devanagariDigitsMap: { [key: string]: string } = {
  '0': '०',
  '1': '१',
  '2': '२',
  '3': '३',
  '4': '४',
  '5': '५',
  '6': '६',
  '7': '७',
  '8': '८',
  '9': '९',
};

export function toDevanagariDigits(input: string | number): string {
  const str = String(input);
  return str.replace(/[0-9]/g, (match) => devanagariDigitsMap[match] || match);
}

/**
 * Formats a number according to the Indian numbering system (e.g., 12,34,567.89).
 */
export function formatIndianNumber(
  num: number | null | undefined,
  decimals: number = 2,
  useDevanagari: boolean = false
): string {
  if (num === null || num === undefined || isNaN(num)) return '-';

  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const fixed = absNum.toFixed(decimals);
  const [integerPart, decimalPart] = fixed.split('.');

  // Indian grouping: last 3 digits, then groups of 2
  let result = '';
  if (integerPart.length <= 3) {
    result = integerPart;
  } else {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    const groups = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = groups + ',' + lastThree;
  }

  if (decimals > 0 && decimalPart) {
    result += '.' + decimalPart;
  }

  const sign = isNegative ? '-' : '';
  const formatted = sign + result;

  return useDevanagari ? toDevanagariDigits(formatted) : formatted;
}

/**
 * Formats currency in INR: ₹ 1,23,456.78
 */
export function formatINR(
  amount: number | null | undefined,
  decimals: number = 2,
  useDevanagari: boolean = false
): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹ -';
  const formatted = formatIndianNumber(amount, decimals, useDevanagari);
  return `₹${formatted}`;
}

/**
 * Formats a figure in Crores or Lakhs:
 * e.g. "₹ 2,45,670 Cr" (EN) or "₹ २,४५,६७० कोटी" (MR)
 */
export function formatMarketCap(
  crAmount: number | null | undefined,
  locale: Locale = 'en',
  useDevanagari: boolean = false
): string {
  if (crAmount === null || crAmount === undefined || isNaN(crAmount)) return '-';

  const formattedNum = formatIndianNumber(crAmount, 2, useDevanagari);
  const unit = locale === 'mr' ? 'कोटी' : 'Cr';
  return `₹${formattedNum} ${unit}`;
}

/**
 * Formats percentage with sign: +2.45% or -1.12%
 */
export function formatPercent(
  pct: number | null | undefined,
  decimals: number = 2,
  useDevanagari: boolean = false
): string {
  if (pct === null || pct === undefined || isNaN(pct)) return '0.00%';
  const sign = pct > 0 ? '+' : '';
  const formatted = formatIndianNumber(pct, decimals, useDevanagari);
  return `${sign}${formatted}%`;
}
