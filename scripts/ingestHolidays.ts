import { getDb } from '../lib/db.ts';

export async function ingestHolidays() {
  const db = getDb();
  console.log('Ingesting official 2026 Indian Stock Market Holiday Calendar (NSE & BSE)...');

  // Official NSE/BSE Trading Holidays for 2026
  const holidays = [
    { date: '2026-01-26', name: 'Republic Day', nameMr: 'प्रजासत्ताक दिन', exchange: 'NSE' },
    { date: '2026-01-26', name: 'Republic Day', nameMr: 'प्रजासत्ताक दिन', exchange: 'BSE' },
    { date: '2026-02-17', name: 'Mahashivratri', nameMr: 'महाशिवरात्री', exchange: 'NSE' },
    { date: '2026-02-17', name: 'Mahashivratri', nameMr: 'महाशिवरात्री', exchange: 'BSE' },
    { date: '2026-03-04', name: 'Holi (Second Day)', nameMr: 'धुलिवंदन / होळी', exchange: 'NSE' },
    { date: '2026-03-04', name: 'Holi (Second Day)', nameMr: 'धुलिवंदन / होळी', exchange: 'BSE' },
    { date: '2026-03-20', name: 'Id-Ul-Fitr (Ramadan Eid)', nameMr: 'रमझान ईद', exchange: 'NSE' },
    { date: '2026-03-20', name: 'Id-Ul-Fitr (Ramadan Eid)', nameMr: 'रमझान ईद', exchange: 'BSE' },
    { date: '2026-04-03', name: 'Good Friday', nameMr: 'गुड फ्रायडे', exchange: 'NSE' },
    { date: '2026-04-03', name: 'Good Friday', nameMr: 'गुड फ्रायडे', exchange: 'BSE' },
    { date: '2026-04-14', name: 'Dr. Baba Saheb Ambedkar Jayanti', nameMr: 'डॉ. बाबासाहेब आंबेडकर जयंती', exchange: 'NSE' },
    { date: '2026-04-14', name: 'Dr. Baba Saheb Ambedkar Jayanti', nameMr: 'डॉ. बाबासाहेब आंबेडकर जयंती', exchange: 'BSE' },
    { date: '2026-05-01', name: 'Maharashtra Day', nameMr: 'महाराष्ट्र दिन', exchange: 'NSE' },
    { date: '2026-05-01', name: 'Maharashtra Day', nameMr: 'महाराष्ट्र दिन', exchange: 'BSE' },
    { date: '2026-05-28', name: 'Bakri Id / Eid ul-Adha', nameMr: 'बकरी ईद', exchange: 'NSE' },
    { date: '2026-05-28', name: 'Bakri Id / Eid ul-Adha', nameMr: 'बकरी ईद', exchange: 'BSE' },
    { date: '2026-06-26', name: 'Muharram', nameMr: 'मोहरम', exchange: 'NSE' },
    { date: '2026-06-26', name: 'Muharram', nameMr: 'मोहरम', exchange: 'BSE' },
    { date: '2026-09-14', name: 'Ganesh Chaturthi', nameMr: 'गणेश चतुर्थी', exchange: 'NSE' },
    { date: '2026-09-14', name: 'Ganesh Chaturthi', nameMr: 'गणेश चतुर्थी', exchange: 'BSE' },
    { date: '2026-10-02', name: 'Mahatma Gandhi Jayanti', nameMr: 'महात्मा गांधी जयंती', exchange: 'NSE' },
    { date: '2026-10-02', name: 'Mahatma Gandhi Jayanti', nameMr: 'महात्मा गांधी जयंती', exchange: 'BSE' },
    { date: '2026-10-20', name: 'Dussehra (Vijay Dashami)', nameMr: 'दसरा', exchange: 'NSE' },
    { date: '2026-10-20', name: 'Dussehra (Vijay Dashami)', nameMr: 'दसरा', exchange: 'BSE' },
    { date: '2026-11-09', name: 'Diwali Balipratipada', nameMr: 'दिवाळी बलिप्रतिपदा', exchange: 'NSE' },
    { date: '2026-11-09', name: 'Diwali Balipratipada', nameMr: 'दिवाळी बलिप्रतिपदा', exchange: 'BSE' },
    { date: '2026-11-24', name: 'Prakash Gurpurb (Sri Guru Nanak Jayanti)', nameMr: 'गुरुनानक जयंती', exchange: 'NSE' },
    { date: '2026-11-24', name: 'Prakash Gurpurb (Sri Guru Nanak Jayanti)', nameMr: 'गुरुनानक जयंती', exchange: 'BSE' },
    { date: '2026-12-25', name: 'Christmas', nameMr: 'नाताळ (ख्रिसमस)', exchange: 'NSE' },
    { date: '2026-12-25', name: 'Christmas', nameMr: 'नाताळ (ख्रिसमस)', exchange: 'BSE' },
  ];

  const stmt = db.prepare(`
    INSERT INTO market_holiday (id, date, holiday_name, holiday_name_mr, exchange)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(date, exchange) DO UPDATE SET
      holiday_name = excluded.holiday_name,
      holiday_name_mr = excluded.holiday_name_mr
  `);

  for (const h of holidays) {
    const id = `hol-${h.exchange.toLowerCase()}-${h.date}`;
    stmt.run(id, h.date, h.name, h.nameMr, h.exchange);
  }

  // Record freshness
  db.prepare(`
    INSERT INTO data_freshness (dataset, latest_as_of, last_successful_run, record_count, status)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(dataset) DO UPDATE SET
      latest_as_of = excluded.latest_as_of,
      last_successful_run = excluded.last_successful_run,
      record_count = excluded.record_count,
      status = excluded.status
  `).run('market_holiday', '2026-12-25', new Date().toISOString(), holidays.length, 'OK');

  console.log(`Successfully ingested ${holidays.length} market holidays for 2026.`);
}

if (process.argv[1]?.includes('ingestHolidays')) {
  ingestHolidays().catch(console.error);
}
