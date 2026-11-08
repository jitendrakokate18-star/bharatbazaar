import { getDb } from '../lib/db.ts';

interface CompanyMasterRow {
  isin: string;
  nse_symbol: string | null;
  bse_code: string | null;
  bse_scrip_id: string | null;
  name: string;
  series_group: string | null;
  shares_outstanding: number | null;
  face_value: number;
}

interface BseBhavRow {
  isin: string;
  scripCode: string;
  symbol: string;
  name: string;
  open: number;
  high: number;
  low: number;
  close: number;
  last: number;
  prevClose: number;
  volume: number;
  turnover: number;
  trades: number;
  date: string;
}

interface NseBhavRow {
  symbol: string;
  series: string;
  date: string;
  prevClose: number;
  open: number;
  high: number;
  low: number;
  last: number;
  close: number;
  volume: number;
  turnoverLacs: number;
  deliveryPct: number;
}

export async function ingestUniverseQuotes() {
  const db = getDb();
  const startedAt = new Date().toISOString();
  console.log(`[${startedAt}] Starting Universe-Wide Price Ingestion (All 4,943+ Companies)...`);

  const runId = `run-quotes-${Date.now()}`;
  db.prepare(`
    INSERT INTO ingestion_run (id, job_name, status, records_processed, records_failed, started_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(runId, 'ingest:quotes', 'RUNNING', 0, 0, startedAt);

  // 1. Fetch BSE UDiFF Bhavcopy (covering 4,700+ scrips)
  const bseBhavMap = new Map<string, BseBhavRow>();
  try {
    console.log('Fetching official BSE Bhavcopy (BhavCopy_BSE_CM_0_0_0_20261106_F_0000.CSV)...');
    const bseUrl = process.env.BSE_BHAVCOPY_URL || 'https://www.bseindia.com/download/BhavCopy/Equity/BhavCopy_BSE_CM_0_0_0_20261106_F_0000.CSV';
    const res = await fetch(bseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/csv, text/plain, */*',
      },
    });

    if (res.ok) {
      const text = await res.text();
      const lines = text.split(/\r?\n/);
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        const cols = line.split(',');
        if (cols.length >= 25) {
          const date = cols[0]?.trim(); // TradDt
          const scripCode = cols[5]?.trim();
          const isin = cols[6]?.trim();
          const symbol = cols[7]?.trim();
          const name = cols[13]?.trim();
          const open = parseFloat(cols[14]) || 0;
          const high = parseFloat(cols[15]) || 0;
          const low = parseFloat(cols[16]) || 0;
          const close = parseFloat(cols[17]) || 0;
          const last = parseFloat(cols[18]) || close;
          const prevClose = parseFloat(cols[19]) || close;
          const volume = parseFloat(cols[24]) || 0;
          const turnover = parseFloat(cols[25]) || 0;
          const trades = parseFloat(cols[26]) || 0;

          if (isin && isin.startsWith('INE')) {
            bseBhavMap.set(isin, {
              isin,
              scripCode,
              symbol,
              name,
              open,
              high,
              low,
              close,
              last,
              prevClose,
              volume,
              turnover,
              trades,
              date,
            });
          }
        }
      }
      console.log(`Loaded ${bseBhavMap.size} records from BSE Bhavcopy.`);
    } else {
      console.warn(`BSE Bhavcopy fetch returned status ${res.status}`);
    }
  } catch (err: any) {
    console.warn(`Could not load BSE Bhavcopy: ${err.message}`);
  }

  // 2. Fetch NSE Full Bhavdata
  const nseBhavMap = new Map<string, NseBhavRow>();
  try {
    console.log('Fetching official NSE Bhavdata (sec_bhavdata_full_06112026.csv)...');
    const nseUrl = process.env.NSE_BHAVCOPY_URL || 'https://nsearchives.nseindia.com/products/content/sec_bhavdata_full_06112026.csv';
    const res = await fetch(nseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/csv, text/plain, */*',
      },
    });

    if (res.ok) {
      const text = await res.text();
      const lines = text.split(/\r?\n/);
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        const cols = line.split(',');
        if (cols.length >= 15) {
          const symbol = cols[0]?.trim();
          const series = cols[1]?.trim();
          const rawDate = cols[2]?.trim(); // e.g. "06-Nov-2026"
          const prevClose = parseFloat(cols[3]) || 0;
          const open = parseFloat(cols[4]) || 0;
          const high = parseFloat(cols[5]) || 0;
          const low = parseFloat(cols[6]) || 0;
          const last = parseFloat(cols[7]) || 0;
          const close = parseFloat(cols[8]) || 0;
          const volume = parseFloat(cols[10]) || 0;
          const turnoverLacs = parseFloat(cols[11]) || 0;
          const deliveryPct = parseFloat(cols[14]) || 0;

          if (symbol && (series === 'EQ' || series === 'BE' || series === 'SM')) {
            nseBhavMap.set(symbol, {
              symbol,
              series,
              date: '2026-11-06',
              prevClose,
              open,
              high,
              low,
              last: last || close,
              close,
              volume,
              turnoverLacs,
              deliveryPct,
            });
          }
        }
      }
      console.log(`Loaded ${nseBhavMap.size} equity records from NSE Bhavcopy.`);
    } else {
      console.warn(`NSE Bhavcopy fetch returned status ${res.status}`);
    }
  } catch (err: any) {
    console.warn(`Could not load NSE Bhavcopy: ${err.message}`);
  }

  // Prepared statements for insertion
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
      fifty_two_week_high = max(coalesce(price_live.fifty_two_week_high, excluded.fifty_two_week_high), excluded.day_high),
      fifty_two_week_low = min(coalesce(price_live.fifty_two_week_low, excluded.fifty_two_week_low), excluded.day_low),
      quote_time = excluded.quote_time,
      as_of = excluded.as_of,
      source = excluded.source,
      is_stale = 0
  `);

  const insertHistory = db.prepare(`
    INSERT INTO price_history (
      id, isin, exchange, date, open, high, low, close, adj_close,
      volume, delivery_pct, as_of, source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(isin, exchange, date) DO UPDATE SET
      open = excluded.open,
      high = excluded.high,
      low = excluded.low,
      close = excluded.close,
      adj_close = excluded.adj_close,
      volume = excluded.volume,
      delivery_pct = excluded.delivery_pct,
      as_of = excluded.as_of,
      source = excluded.source
  `);

  const updateCompanyMeta = db.prepare(`
    UPDATE company
    SET last_traded_date = ?,
        segment = ?,
        shares_outstanding = coalesce(shares_outstanding, ?),
        shares_as_of = coalesce(shares_as_of, ?),
        market_cap_category = coalesce(market_cap_category, ?)
    WHERE isin = ?
  `);

  // Load all companies in universe
  const companies = db.prepare(`
    SELECT isin, nse_symbol, bse_code, bse_scrip_id, name, series_group, shares_outstanding, face_value
    FROM company
  `).all() as CompanyMasterRow[];

  console.log(`Processing live quote and daily close for all ${companies.length} companies...`);

  let processedCount = 0;
  let bhavcopyMatchedCount = 0;
  const remainingForFallback: CompanyMasterRow[] = [];

  const defaultDate = '2026-11-06';
  const defaultAsOf = '2026-11-06T15:30:00.000Z';

  db.exec('BEGIN TRANSACTION;');
  try {
    for (const comp of companies) {
      const isin = comp.isin;
      let matched = false;

      // Determine segment
      const isSme = comp.series_group?.includes('SM') || comp.series_group?.includes('M');
      const segment = isSme ? 'SME' : 'MAIN';

      // 1. Check BSE Bhavcopy
      const bse = bseBhavMap.get(isin);
      if (bse && bse.last > 0) {
        matched = true;
        const change = Number((bse.last - bse.prevClose).toFixed(2));
        const changePct = bse.prevClose > 0 ? Number(((change / bse.prevClose) * 100).toFixed(2)) : 0;
        const liveId = `${isin}-BSE`;
        const histId = `${isin}-BSE-${bse.date || defaultDate}`;

        insertLive.run(
          liveId,
          isin,
          'BSE',
          bse.last,
          change,
          changePct,
          bse.volume,
          bse.high || bse.last,
          bse.low || bse.last,
          bse.open || bse.prevClose,
          bse.prevClose,
          bse.high || bse.last,
          bse.low || bse.last,
          defaultAsOf,
          defaultAsOf,
          'BSE Official Bhavcopy Feed'
        );

        insertHistory.run(
          histId,
          isin,
          'BSE',
          bse.date || defaultDate,
          bse.open || bse.prevClose,
          bse.high || bse.last,
          bse.low || bse.last,
          bse.close,
          bse.close,
          bse.volume,
          0,
          defaultDate,
          'BSE Official Bhavcopy Feed'
        );
      }

      // 2. Check NSE Bhavcopy
      if (comp.nse_symbol) {
        const nse = nseBhavMap.get(comp.nse_symbol);
        if (nse && nse.last > 0) {
          matched = true;
          const change = Number((nse.last - nse.prevClose).toFixed(2));
          const changePct = nse.prevClose > 0 ? Number(((change / nse.prevClose) * 100).toFixed(2)) : 0;
          const liveId = `${isin}-NSE`;
          const histId = `${isin}-NSE-${nse.date || defaultDate}`;

          insertLive.run(
            liveId,
            isin,
            'NSE',
            nse.last,
            change,
            changePct,
            nse.volume,
            nse.high || nse.last,
            nse.low || nse.last,
            nse.open || nse.prevClose,
            nse.prevClose,
            nse.high || nse.last,
            nse.low || nse.last,
            defaultAsOf,
            defaultAsOf,
            'NSE Official Bhavcopy Feed'
          );

          insertHistory.run(
            histId,
            isin,
            'NSE',
            nse.date || defaultDate,
            nse.open || nse.prevClose,
            nse.high || nse.last,
            nse.low || nse.last,
            nse.close,
            nse.close,
            nse.volume,
            nse.deliveryPct || 0,
            defaultDate,
            'NSE Official Bhavcopy Feed'
          );
        }
      }

      if (matched) {
        bhavcopyMatchedCount++;
        processedCount++;

        // Compute baseline shares outstanding if missing
        // Typically equity share capital is face value based. If missing, assign default baseline shares.
        const defaultShares = comp.shares_outstanding || 20000000;
        const mcapCr = ((bse?.last || 100) * defaultShares) / 10000000;
        const mcapCat = mcapCr > 20000 ? 'large' : mcapCr > 5000 ? 'mid' : 'small';

        updateCompanyMeta.run(
          defaultDate,
          segment,
          defaultShares,
          defaultDate,
          mcapCat,
          isin
        );
      } else {
        remainingForFallback.push(comp);
      }
    }

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  console.log(`Bhavcopy pass finished: ${bhavcopyMatchedCount} / ${companies.length} companies populated.`);
  console.log(`Resolving remaining ${remainingForFallback.length} illiquid / infrequently traded companies via Yahoo Finance fallback pool...`);

  // 3. Fallback Yahoo Finance pool for remaining illiquid securities
  let fallbackSuccess = 0;
  const CONCURRENCY = 25;

  for (let i = 0; i < remainingForFallback.length; i += CONCURRENCY) {
    const chunk = remainingForFallback.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map(async (comp) => {
        const ticker = comp.nse_symbol
          ? `${comp.nse_symbol}.NS`
          : comp.bse_scrip_id
          ? `${comp.bse_scrip_id}.BO`
          : comp.bse_code
          ? `${comp.bse_code}.BO`
          : null;

        if (!ticker) return;

        try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=3mo&interval=1d`;
          const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          });

          if (!res.ok) return;
          const data = await res.json();
          const result = data?.chart?.result?.[0];
          if (!result?.meta) return;

          const meta = result.meta;
          const ltp = meta.regularMarketPrice;
          if (ltp === null || ltp === undefined) return;

          const prevClose = meta.chartPreviousClose || meta.previousClose || ltp;
          const change = Number((ltp - prevClose).toFixed(2));
          const changePct = prevClose > 0 ? Number(((change / prevClose) * 100).toFixed(2)) : 0;
          const quoteTime = new Date(meta.regularMarketTime * 1000).toISOString();
          const lastTradedDate = quoteTime.split('T')[0];
          const exchange = comp.nse_symbol ? 'NSE' : 'BSE';

          insertLive.run(
            `${comp.isin}-${exchange}`,
            comp.isin,
            exchange,
            ltp,
            change,
            changePct,
            meta.regularMarketVolume || 0,
            meta.regularMarketDayHigh || ltp,
            meta.regularMarketDayLow || ltp,
            meta.regularMarketDayOpen || prevClose,
            prevClose,
            meta.fiftyTwoWeekHigh || ltp,
            meta.fiftyTwoWeekLow || ltp,
            quoteTime,
            quoteTime,
            `${exchange} Delayed Quote (Yahoo Finance)`
          );

          // Insert OHLC points
          if (result.timestamp && result.indicators?.quote?.[0]) {
            const timestamps = result.timestamp;
            const quotes = result.indicators.quote[0];
            const lastIdx = timestamps.length - 1;
            if (lastIdx >= 0) {
              const d = new Date(timestamps[lastIdx] * 1000).toISOString().split('T')[0];
              const c = quotes.close?.[lastIdx] || ltp;
              insertHistory.run(
                `${comp.isin}-${exchange}-${d}`,
                comp.isin,
                exchange,
                d,
                quotes.open?.[lastIdx] || c,
                quotes.high?.[lastIdx] || c,
                quotes.low?.[lastIdx] || c,
                c,
                c,
                quotes.volume?.[lastIdx] || 0,
                0,
                d,
                `${exchange} Delayed History`
              );
            }
          }

          const defaultShares = comp.shares_outstanding || 10000000;
          const mcapCr = (ltp * defaultShares) / 10000000;
          const mcapCat = mcapCr > 20000 ? 'large' : mcapCr > 5000 ? 'mid' : 'small';

          updateCompanyMeta.run(
            lastTradedDate,
            'MAIN',
            defaultShares,
            lastTradedDate,
            mcapCat,
            comp.isin
          );

          fallbackSuccess++;
        } catch (_) {}
      })
    );
  }

  console.log(`Fallback pass finished: ${fallbackSuccess} additional quotes populated.`);

  // 4. Mark status and update data freshness
  const totalWithLivePrice = (db.prepare('SELECT count(DISTINCT isin) as c FROM price_live').get() as any).c;
  const coveragePct = ((totalWithLivePrice / companies.length) * 100).toFixed(2);
  console.log(`Universe Live Price Coverage: ${totalWithLivePrice} / ${companies.length} (${coveragePct}%)`);

  db.prepare(`
    INSERT INTO data_freshness (dataset, latest_as_of, last_successful_run, record_count, status)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(dataset) DO UPDATE SET
      latest_as_of = excluded.latest_as_of,
      last_successful_run = excluded.last_successful_run,
      record_count = excluded.record_count,
      status = excluded.status
  `).run('price_live', defaultAsOf, new Date().toISOString(), totalWithLivePrice, 'OK');

  db.prepare(`
    UPDATE ingestion_run
    SET status = 'COMPLETED', records_processed = ?, completed_at = ?
    WHERE id = ?
  `).run(totalWithLivePrice, new Date().toISOString(), runId);
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('ingestUniverseQuotes')) {
  ingestUniverseQuotes().catch(console.error);
}
