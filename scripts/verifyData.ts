import { getDb } from '../lib/db.ts';

const db = getDb();

console.log('=== VERIFICATION & PROOF SCRIPT ===\n');

// a) Total companies
const total = (db.prepare('SELECT COUNT(*) as c FROM company').get() as any).c;
const dual = (db.prepare('SELECT COUNT(*) as c FROM company WHERE nse_symbol IS NOT NULL AND bse_code IS NOT NULL').get() as any).c;
const nseOnly = (db.prepare('SELECT COUNT(*) as c FROM company WHERE nse_symbol IS NOT NULL AND bse_code IS NULL').get() as any).c;
const bseOnly = (db.prepare('SELECT COUNT(*) as c FROM company WHERE nse_symbol IS NULL AND bse_code IS NOT NULL').get() as any).c;
console.log(`a) COMPANIES: Total = ${total}, Dual-listed = ${dual}, NSE-only = ${nseOnly}, BSE-only = ${bseOnly}`);

// b) Latest Sensex and Nifty
const indices = db.prepare('SELECT * FROM index_quote').all() as any[];
const latestIndexDate = (db.prepare('SELECT MAX(date) as d FROM index_history').get() as any).d;
console.log(`b) INDICES: Latest EOD Date in index_history = ${latestIndexDate}`);
for (const idx of indices) {
  console.log(`   ${idx.name} (${idx.symbol}): LTP = ${idx.ltp}, Change = ${idx.change} (${idx.change_pct}%), Quote Time = ${idx.quote_time}`);
}

// c) Sample 5 companies: Reliance, TCS, HDFC Bank, CDSL (mid-cap), 20 Microns (small-cap)
const sampleTargets = [
  { name: 'Reliance Industries', isin: 'INE002A01018', symbol: 'RELIANCE' },
  { name: 'Tata Consultancy Services', isin: 'INE467B01029', symbol: 'TCS' },
  { name: 'HDFC Bank', isin: 'INE040A01034', symbol: 'HDFCBANK' },
  { name: 'CDSL (Mid-cap)', isin: 'INE736A01011', symbol: 'CDSL' },
  { name: '20 Microns (Small-cap)', isin: 'INE144J01027', symbol: '20MICRONS' },
];

console.log('\nc) SAMPLE 5 COMPANIES LATEST CLOSES:');
for (const s of sampleTargets) {
  const nseRow = db.prepare("SELECT close, date, as_of FROM price_history WHERE isin = ? AND exchange = 'NSE' ORDER BY date DESC LIMIT 1").get(s.isin) as any;
  const bseRow = db.prepare("SELECT close, date, as_of FROM price_history WHERE isin = ? AND exchange = 'BSE' ORDER BY date DESC LIMIT 1").get(s.isin) as any;
  const nseLive = db.prepare("SELECT ltp, quote_time FROM price_live WHERE isin = ? AND exchange = 'NSE'").get(s.isin) as any;
  const bseLive = db.prepare("SELECT ltp, quote_time FROM price_live WHERE isin = ? AND exchange = 'BSE'").get(s.isin) as any;
  console.log(`   ${s.name} (${s.isin}):`);
  console.log(`     NSE: Close = ₹${nseRow?.close} (Date: ${nseRow?.date}), Live LTP = ₹${nseLive?.ltp || '-'}`);
  console.log(`     BSE: Close = ₹${bseRow?.close} (Date: ${bseRow?.date}), Live LTP = ₹${bseLive?.ltp || '-'}`);
}

// d) FY25 and FY26 financials & latest quarter
console.log('\nd) FY25 & FY26 FINANCIALS & LATEST QUARTER:');
for (const s of sampleTargets) {
  const fy25 = db.prepare("SELECT period, revenue_cr, net_profit_cr, period_end_date, source FROM financials_annual WHERE isin = ? AND period = 'FY25'").get(s.isin) as any;
  const fy26 = db.prepare("SELECT period, revenue_cr, net_profit_cr, period_end_date, source FROM financials_annual WHERE isin = ? AND period = 'FY26'").get(s.isin) as any;
  const latestQ = db.prepare('SELECT quarter_label, revenue_cr, net_profit_cr, period_end_date, source FROM financials_quarterly WHERE isin = ? ORDER BY period_end_date DESC LIMIT 1').get(s.isin) as any;
  console.log(`   ${s.name}:`);
  console.log(`     FY25: Revenue = ₹${fy25?.revenue_cr} Cr, Net Profit = ₹${fy25?.net_profit_cr} Cr (Period End: ${fy25?.period_end_date}, Source: ${fy25?.source})`);
  console.log(`     FY26: Revenue = ₹${fy26?.revenue_cr} Cr, Net Profit = ₹${fy26?.net_profit_cr} Cr (Period End: ${fy26?.period_end_date}, Source: ${fy26?.source})`);
  console.log(`     Latest Quarter: ${latestQ?.quarter_label} (End Date: ${latestQ?.period_end_date}), Rev = ₹${latestQ?.revenue_cr} Cr, PAT = ₹${latestQ?.net_profit_cr} Cr`);
}

// e) Shareholding & Corporate Actions
console.log('\ne) LATEST SHAREHOLDING & CORPORATE ACTIONS:');
for (const s of sampleTargets) {
  const sh = db.prepare('SELECT quarter_label, promoter, fii, dii, public, period_end_date FROM shareholding WHERE isin = ? ORDER BY period_end_date DESC LIMIT 1').get(s.isin) as any;
  const ca = db.prepare('SELECT type, ex_date, ratio_or_amount, description_en FROM corporate_action WHERE isin = ? ORDER BY ex_date DESC LIMIT 1').get(s.isin) as any;
  console.log(`   ${s.name}:`);
  console.log(`     Shareholding: ${sh?.quarter_label} (Promoter: ${sh?.promoter}%, FII: ${sh?.fii}%, DII: ${sh?.dii}%, Public: ${sh?.public}%)`);
  console.log(`     Corporate Action: ${ca?.type} on ${ca?.ex_date} (${ca?.ratio_or_amount}) - ${ca?.description_en}`);
}
