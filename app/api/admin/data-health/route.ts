import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getMarketStatus } from '@/lib/dates';

export async function GET() {
  const db = getDb();

  // 1. Company Master stats
  const totalComp = (db.prepare('SELECT COUNT(*) as c FROM company').get() as any).c;
  const dualComp = (db.prepare('SELECT COUNT(*) as c FROM company WHERE nse_symbol IS NOT NULL AND bse_code IS NOT NULL').get() as any).c;
  const nseOnlyComp = (db.prepare('SELECT COUNT(*) as c FROM company WHERE nse_symbol IS NOT NULL AND bse_code IS NULL').get() as any).c;
  const bseOnlyComp = (db.prepare('SELECT COUNT(*) as c FROM company WHERE nse_symbol IS NULL AND bse_code IS NOT NULL').get() as any).c;

  // 2. Price stats
  const livePricesCount = (db.prepare('SELECT COUNT(*) as c FROM price_live').get() as any).c;
  const latestLiveQuote = (db.prepare('SELECT MAX(quote_time) as q FROM price_live').get() as any)?.q;

  const historyRowsCount = (db.prepare('SELECT COUNT(*) as c FROM price_history').get() as any).c;
  const latestHistoryDate = (db.prepare('SELECT MAX(date) as d FROM price_history').get() as any)?.d;

  // 3. Index stats
  const indexQuotesCount = (db.prepare('SELECT COUNT(*) as c FROM index_quote').get() as any).c;
  const latestIndexHistoryDate = (db.prepare('SELECT MAX(date) as d FROM index_history').get() as any)?.d;

  // 4. Financials stats
  const annualFinCount = (db.prepare('SELECT COUNT(*) as c FROM financials_annual').get() as any).c;
  const quarterlyFinCount = (db.prepare('SELECT COUNT(*) as c FROM financials_quarterly').get() as any).c;
  const annualByFy = db.prepare('SELECT fiscal_year, COUNT(*) as count FROM financials_annual GROUP BY fiscal_year ORDER BY fiscal_year DESC').all();
  const quarterlyByQ = db.prepare('SELECT quarter_label, COUNT(*) as count FROM financials_quarterly GROUP BY quarter_label ORDER BY period_end_date DESC LIMIT 8').all();

  // 5. Shareholding & Corporate Actions
  const shareholdingCount = (db.prepare('SELECT COUNT(*) as c FROM shareholding').get() as any).c;
  const corpActionsCount = (db.prepare('SELECT COUNT(*) as c FROM corporate_action').get() as any).c;
  const dividendsCount = (db.prepare("SELECT COUNT(*) as c FROM corporate_action WHERE type = 'DIVIDEND'").get() as any).c;
  const splitsCount = (db.prepare("SELECT COUNT(*) as c FROM corporate_action WHERE type IN ('SPLIT', 'BONUS')").get() as any).c;

  // 6. Data Freshness table
  const freshnessRows = db.prepare('SELECT * FROM data_freshness').all();

  // 7. Holidays
  const holidaysCount = (db.prepare('SELECT COUNT(*) as c FROM market_holiday').get() as any).c;

  return NextResponse.json({
    status: 'HEALTHY',
    systemDate: new Date().toISOString().split('T')[0],
    marketStatus: getMarketStatus(),
    dataProviderMode: process.env.DATA_PROVIDER === 'mock' ? 'MOCK' : 'REAL (Free Delayed Feeds)',
    companyMaster: {
      total: totalComp,
      dualListed: dualComp,
      nseOnly: nseOnlyComp,
      bseOnly: bseOnlyComp,
    },
    livePrices: {
      count: livePricesCount,
      latestQuoteTime: latestLiveQuote,
    },
    priceHistory: {
      totalRows: historyRowsCount,
      latestCloseDate: latestHistoryDate,
    },
    indices: {
      count: indexQuotesCount,
      latestCloseDate: latestIndexHistoryDate,
    },
    financials: {
      annualCount: annualFinCount,
      quarterlyCount: quarterlyFinCount,
      byFiscalYear: annualByFy,
      byQuarter: quarterlyByQ,
    },
    shareholding: {
      count: shareholdingCount,
    },
    corporateActions: {
      total: corpActionsCount,
      dividends: dividendsCount,
      splitsAndBonus: splitsCount,
    },
    holidaysCount,
    freshness: freshnessRows,
  });
}
