import type { Locale, MarketStatus } from '../types/index.ts';
import { toDevanagariDigits } from './currency.ts';

const MARATHI_MONTHS = [
  'जानेवारी',
  'फेब्रुवारी',
  'मार्च',
  'एप्रिल',
  'मे',
  'जून',
  'जुलै',
  'ऑगस्ट',
  'सप्टेंबर',
  'ऑक्टोबर',
  'नोव्हेंबर',
  'डिसेंबर',
];

const ENGLISH_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Returns current IST time and Indian stock market status.
 */
export function getMarketStatus(): MarketStatus {
  // Current UTC time converted to IST (UTC + 5:30)
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const istOffset = 5.5 * 3600000; // 5 hours 30 mins
  const istDate = new Date(utcMs + istOffset);

  const dayOfWeek = istDate.getDay(); // 0 is Sunday, 6 is Saturday
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const timeMinutes = hours * 60 + minutes;

  const istTimeFormatted = istDate.toLocaleTimeString('en-IN', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) + ' IST';

  // Weekend check
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      status: 'WEEKEND',
      messageEn: 'Market Closed (Weekend)',
      messageMr: 'बाजार बंद (शनिवार/रविवार)',
      nextChange: 'Monday 09:00 AM IST',
      istTime: istTimeFormatted,
    };
  }

  // Pre-Open: 09:00 to 09:15
  if (timeMinutes >= 9 * 60 && timeMinutes < 9 * 60 + 15) {
    return {
      status: 'PRE_OPEN',
      messageEn: 'Pre-Open Session',
      messageMr: 'प्री-ओपन सत्र चालू',
      nextChange: '09:15 AM IST (Regular Trading)',
      istTime: istTimeFormatted,
    };
  }

  // Regular Trading: 09:15 to 15:30
  if (timeMinutes >= 9 * 60 + 15 && timeMinutes < 15 * 60 + 30) {
    return {
      status: 'OPEN',
      messageEn: 'Market Open (Live)',
      messageMr: 'बाजार सुरू (थेट दर)',
      nextChange: '03:30 PM IST (Market Close)',
      istTime: istTimeFormatted,
    };
  }

  // Market Closed (After 15:30 or before 09:00)
  return {
    status: 'CLOSED',
    messageEn: 'Market Closed',
    messageMr: 'बाजार बंद (शेवटचा भाव)',
    nextChange: 'Tomorrow 09:00 AM IST',
    istTime: istTimeFormatted,
  };
}

/**
 * Localizes a date string (YYYY-MM-DD) into EN / MR format.
 */
export function formatDate(
  dateStr: string,
  locale: Locale = 'en',
  useDevanagari: boolean = false
): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parts[2];

  if (locale === 'mr') {
    const monthName = MARATHI_MONTHS[monthIdx] || parts[1];
    const formatted = `${day} ${monthName} ${year}`;
    return useDevanagari ? toDevanagariDigits(formatted) : formatted;
  }

  const monthName = ENGLISH_MONTHS[monthIdx] || parts[1];
  const formatted = `${day} ${monthName} ${year}`;
  return useDevanagari ? toDevanagariDigits(formatted) : formatted;
}
