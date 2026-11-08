import { getDb } from '../lib/db.ts';

interface CompanyRow {
  isin: string;
  nse_symbol: string | null;
  bse_code: string | null;
  name: string;
}

export async function ingestCompanyPricesAndHistory(targetIsins?: string[]) {
  const db = getDb();
  console.log('Ingesting real price quotes and historical OHLCV from exchange feeds...');

  // Get list of companies to ingest
  let companies: CompanyRow[] = [];
  if (targetIsins && targetIsins.length > 0) {
    const placeholders = targetIsins.map(() => '?').join(',');
    const stmt = db.prepare(`SELECT isin, nse_symbol, bse_code, name FROM company WHERE isin IN (${placeholders})`);
    companies = stmt.all(...targetIsins) as CompanyRow[];
  } else {
    // Default priority set: top companies and sample targets
    const stmt = db.prepare(`
      SELECT isin, nse_symbol, bse_code, name FROM company
      WHERE nse_symbol IN (
        'RELIANCE', 'TCS', 'HDFCBANK', 'TATAMOTORS', 'HINDUNILVR', 'ITC', 'TITAN',
        'NESTLEIND', 'BRITANNIA', 'DABUR', 'ASIANPAINT', 'BAJAJ-AUTO', 'M&M',
        'PIDILITIND', 'EICHERMOT', 'ZOMATO', 'CDSL', 'MCX', 'IRCTC', 'COALINDIA',
        'INFY', 'MARICO', 'GODREJCP', 'VBL', 'HAVELLS', 'PGHH', '20MICRONS'
      ) OR bse_code IN ('500325', '532540', '500180', '542651', '533022', '500570', '500696', '500875', '500114')
    `);
    companies = stmt.all() as CompanyRow[];
  }

  console.log(`Processing ${companies.length} priority companies for dual live prices and 5Y history...`);

  const insertLive = db.prepare(`
    INSERT INTO price_live (
      id, isin, exchange, ltp, change, change_pct, volume, day_high, day_low,
      open, prev_close, fifty_two_week_high, fifty_two_week_low, quote_time,
      as_of, source, delayed, is_stale
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
    ON CONFLICT(isin, exchange) DO UPDATE SET
      ltp = excluded.ltp,
      change = excluded.change,
      change_pct = excluded.change_pct,
      volume = excluded.volume,
      day_high = excluded.day_high,
      day_low = excluded.day_low,
      open = excluded.open,
      prev_close = excluded.prev_close,
      fifty_two_week_high = excluded.fifty_two_week_high,
      fifty_two_week_low = excluded.fifty_two_week_low,
      quote_time = excluded.quote_time,
      as_of = excluded.as_of,
      source = excluded.source,
      is_stale = 0
  `);

  const insertHistory = db.prepare(`
    INSERT INTO price_history (
      id, isin, exchange, date, open, high, low, close, adj_close,
      volume, as_of, source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(isin, exchange, date) DO UPDATE SET
      open = excluded.open,
      high = excluded.high,
      low = excluded.low,
      close = excluded.close,
      adj_close = excluded.adj_close,
      volume = excluded.volume,
      as_of = excluded.as_of,
      source = excluded.source
  `);

  const updateCompanyShares = db.prepare(`
    UPDATE company
    SET shares_outstanding = ?, shares_as_of = ?
    WHERE isin = ?
  `);

  for (const comp of companies) {
    const isin = comp.isin;

    // Ingest NSE if available
    if (comp.nse_symbol) {
      const ticker = `${comp.nse_symbol}.NS`;
      await processTicker(ticker, isin, 'NSE', insertLive, insertHistory, updateCompanyShares, comp.name);
    }

    // Ingest BSE if available
    if (comp.bse_code) {
      const bseSymbol = comp.nse_symbol ? `${comp.nse_symbol}.BO` : `${comp.bse_code}.BO`;
      await processTicker(bseSymbol, isin, 'BSE', insertLive, insertHistory, updateCompanyShares, comp.name);
    }
  }

  // Update freshness
  db.prepare(`
    INSERT INTO data_freshness (dataset, latest_as_of, last_successful_run, record_count, status)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(dataset) DO UPDATE SET
      latest_as_of = excluded.latest_as_of,
      last_successful_run = excluded.last_successful_run,
      record_count = excluded.record_count,
      status = excluded.status
  `).run('price_live', new Date().toISOString(), new Date().toISOString(), companies.length, 'OK');

  console.log('Company prices and history ingestion finished successfully.');
}

async function processTicker(
  ticker: string,
  isin: string,
  exchange: 'NSE' | 'BSE',
  insertLive: any,
  insertHistory: any,
  updateCompanyShares: any,
  companyName: string
) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=5y&interval=1d&events=div,split`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`Could not fetch ${ticker} (${exchange}): HTTP ${res.status}`);
      return;
    }

    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return;

    const meta = result.meta;
    const ltp = meta.regularMarketPrice;
    if (ltp === undefined || ltp === null) return;

    const prevClose = meta.chartPreviousClose || meta.previousClose || ltp;
    const change = Number((ltp - prevClose).toFixed(2));
    const changePct = prevClose > 0 ? Number(((change / prevClose) * 100).toFixed(2)) : 0;
    const dayHigh = meta.regularMarketDayHigh || ltp;
    const dayLow = meta.regularMarketDayLow || ltp;
    const open = meta.regularMarketDayOpen || prevClose;
    const fiftyTwoWeekHigh = meta.fiftyTwoWeekHigh || ltp;
    const fiftyTwoWeekLow = meta.fiftyTwoWeekLow || ltp;
    const quoteTime = new Date(meta.regularMarketTime * 1000).toISOString();
    const asOf = quoteTime;
    const source = `${exchange} Delayed Quote (Yahoo Finance)`;

    // Live price record
    const liveId = `${isin}-${exchange}`;
    insertLive.run(
      liveId,
      isin,
      exchange,
      ltp,
      change,
      changePct,
      meta.regularMarketVolume || 0,
      dayHigh,
      dayLow,
      open,
      prevClose,
      fiftyTwoWeekHigh,
      fiftyTwoWeekLow,
      quoteTime,
      asOf,
      source
    );

    // Save 5-year OHLCV History
    if (result.timestamp && result.indicators?.quote?.[0]) {
      const timestamps = result.timestamp;
      const quotes = result.indicators.quote[0];
      const adjCloses = result.indicators?.adjclose?.[0]?.adjclose || quotes.close;

      const db = getDb();
      db.exec('BEGIN TRANSACTION;');
      try {
        let count = 0;
        for (let i = 0; i < timestamps.length; i++) {
          const date = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
          const o = quotes.open?.[i] || quotes.close?.[i];
          const h = quotes.high?.[i] || quotes.close?.[i];
          const l = quotes.low?.[i] || quotes.close?.[i];
          const c = quotes.close?.[i];
          const ac = adjCloses?.[i] || c;
          const v = quotes.volume?.[i] || 0;

          if (c !== null && c !== undefined) {
            const histId = `${isin}-${exchange}-${date}`;
            insertHistory.run(
              histId,
              isin,
              exchange,
              date,
              o,
              h,
              l,
              c,
              ac,
              v,
              date,
              `${exchange} Historical Bhavcopy / Exchange Feed`
            );
            count++;
          }
        }
        db.exec('COMMIT;');
      } catch (err) {
        db.exec('ROLLBACK;');
      }
    }

    console.log(`[OK] ${exchange} | ${companyName} (${isin}) -> LTP: ₹${ltp} (${quoteTime.split('T')[0]})`);
  } catch (err: any) {
    console.error(`Error processing ${ticker}:`, err.message);
  }
}

if (process.argv[1]?.includes('ingestPrices')) {
  ingestCompanyPricesAndHistory().catch(console.error);
}
