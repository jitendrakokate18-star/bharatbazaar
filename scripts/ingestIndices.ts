import { getDb } from '../lib/db.ts';

interface IndexMeta {
  symbol: string;
  name: string;
  nameMr: string;
}

const INDICES: IndexMeta[] = [
  { symbol: '^BSESN', name: 'BSE SENSEX', nameMr: 'बीएसई सेन्सेक्स' },
  { symbol: '^NSEI', name: 'NIFTY 50', nameMr: 'निफ्टी ५०' },
  { symbol: '^NSEBANK', name: 'NIFTY BANK', nameMr: 'निफ्टी बँक' },
  { symbol: '^CNXIT', name: 'NIFTY IT', nameMr: 'निफ्टी आयटी' },
];

export async function ingestIndices(fetchHistory = true) {
  const db = getDb();
  console.log('Ingesting real live quotes and 5-year history for Indian Benchmark Indices...');

  const insertQuote = db.prepare(`
    INSERT INTO index_quote (
      symbol, name, name_mr, ltp, change, change_pct, high, low, prev_close,
      quote_time, as_of, source, delayed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(symbol) DO UPDATE SET
      ltp = excluded.ltp,
      change = excluded.change,
      change_pct = excluded.change_pct,
      high = excluded.high,
      low = excluded.low,
      prev_close = excluded.prev_close,
      quote_time = excluded.quote_time,
      as_of = excluded.as_of,
      source = excluded.source
  `);

  const insertHistory = db.prepare(`
    INSERT INTO index_history (id, symbol, date, open, high, low, close, adj_close, volume, as_of, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(symbol, date) DO UPDATE SET
      open = excluded.open,
      high = excluded.high,
      low = excluded.low,
      close = excluded.close,
      adj_close = excluded.adj_close,
      volume = excluded.volume,
      as_of = excluded.as_of,
      source = excluded.source
  `);

  for (const idx of INDICES) {
    try {
      console.log(`Fetching quote & history for ${idx.name} (${idx.symbol})...`);
      const range = fetchHistory ? '5y' : '5d';
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(idx.symbol)}?range=${range}&interval=1d`;

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        console.warn(`Failed to fetch ${idx.symbol}: HTTP ${res.status}`);
        continue;
      }

      const json = await res.json();
      const result = json?.chart?.result?.[0];
      if (!result) continue;

      const meta = result.meta;
      const ltp = meta.regularMarketPrice;
      const prevClose = meta.chartPreviousClose || meta.previousClose || ltp;
      const change = Number((ltp - prevClose).toFixed(2));
      const changePct = prevClose > 0 ? Number(((change / prevClose) * 100).toFixed(2)) : 0;
      const high = meta.regularMarketDayHigh || ltp;
      const low = meta.regularMarketDayLow || ltp;
      const quoteTime = new Date(meta.regularMarketTime * 1000).toISOString();
      const asOf = quoteTime;

      // Upsert Quote
      insertQuote.run(
        idx.symbol,
        idx.name,
        idx.nameMr,
        ltp,
        change,
        changePct,
        high,
        low,
        prevClose,
        quoteTime,
        asOf,
        'Yahoo Finance (Exchange Feed)'
      );

      // Also upsert short alias key like SENSEX and NIFTY50 so legacy lookups succeed
      const shortSymbol = idx.symbol === '^BSESN' ? 'SENSEX' : idx.symbol === '^NSEI' ? 'NIFTY50' : idx.symbol;
      if (shortSymbol !== idx.symbol) {
        insertQuote.run(
          shortSymbol,
          idx.name,
          idx.nameMr,
          ltp,
          change,
          changePct,
          high,
          low,
          prevClose,
          quoteTime,
          asOf,
          'Yahoo Finance (Exchange Feed)'
        );
      }

      // Upsert Historical OHLCV
      if (fetchHistory && result.timestamp && result.indicators?.quote?.[0]) {
        const timestamps = result.timestamp;
        const quotes = result.indicators.quote[0];
        const adjCloses = result.indicators?.adjclose?.[0]?.adjclose || quotes.close;

        let histCount = 0;
        db.exec('BEGIN TRANSACTION;');
        try {
          for (let i = 0; i < timestamps.length; i++) {
            const date = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
            const open = quotes.open?.[i] || quotes.close?.[i];
            const h = quotes.high?.[i] || quotes.close?.[i];
            const l = quotes.low?.[i] || quotes.close?.[i];
            const close = quotes.close?.[i];
            const adjClose = adjCloses?.[i] || close;
            const volume = quotes.volume?.[i] || 0;

            if (close !== null && close !== undefined) {
              const histId = `${idx.symbol}-${date}`;
              insertHistory.run(
                histId,
                idx.symbol,
                date,
                open,
                h,
                l,
                close,
                adjClose,
                volume,
                asOf,
                'Yahoo Finance (Exchange Feed)'
              );
              histCount++;
            }
          }
          db.exec('COMMIT;');
          console.log(`Saved ${histCount} daily historical points for ${idx.symbol}.`);
        } catch (e) {
          db.exec('ROLLBACK;');
          console.error(`Error saving history for ${idx.symbol}:`, e);
        }
      }
    } catch (err: any) {
      console.error(`Failed to ingest index ${idx.symbol}:`, err.message);
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
  `).run('index_data', new Date().toISOString(), new Date().toISOString(), INDICES.length, 'OK');

  console.log('Index ingestion completed.');
}

if (process.argv[1]?.includes('ingestIndices')) {
  ingestIndices(true).catch(console.error);
}
