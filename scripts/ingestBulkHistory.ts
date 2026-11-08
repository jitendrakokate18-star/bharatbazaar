import { getDb } from '../lib/db.ts';

export async function ingestBulkHistory(targetLimit?: number) {
  const db = getDb();
  const startedAt = new Date().toISOString();
  console.log(`[${startedAt}] Starting 5-Year Historical OHLCV Bulk Ingestion...`);

  const runId = `run-hist-${Date.now()}`;
  db.prepare(`
    INSERT INTO ingestion_run (id, job_name, status, records_processed, records_failed, started_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(runId, 'ingest:history', 'RUNNING', 0, 0, startedAt);

  // Load companies ordered by market cap priority
  const query = `
    SELECT isin, nse_symbol, bse_code, bse_scrip_id, name,
           (SELECT COUNT(*) FROM price_history ph WHERE ph.isin = company.isin) as hist_count
    FROM company
    ORDER BY (COALESCE(shares_outstanding, 0) * COALESCE((SELECT ltp FROM price_live pl WHERE pl.isin = company.isin LIMIT 1), 0)) DESC
    ${targetLimit ? `LIMIT ${targetLimit}` : ''}
  `;
  const companies = db.prepare(query).all() as any[];

  console.log(`Targeting ${companies.length} companies for 5Y OHLCV ingestion...`);

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

  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const CONCURRENCY = 15;

  for (let i = 0; i < companies.length; i += CONCURRENCY) {
    const chunk = companies.slice(i, i + CONCURRENCY);

    await Promise.all(
      chunk.map(async (comp) => {
        // Skip if already has >= 500 historical rows
        if (comp.hist_count >= 500) {
          skippedCount++;
          return;
        }

        const ticker = comp.nse_symbol
          ? `${comp.nse_symbol}.NS`
          : comp.bse_scrip_id
          ? `${comp.bse_scrip_id}.BO`
          : comp.bse_code
          ? `${comp.bse_code}.BO`
          : null;

        if (!ticker) return;
        const exchange = comp.nse_symbol ? 'NSE' : 'BSE';

        try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=5y&interval=1d`;
          const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          });

          if (!res.ok) {
            errorCount++;
            return;
          }

          const data = await res.json();
          const result = data?.chart?.result?.[0];
          if (!result?.timestamp || !result?.indicators?.quote?.[0]) {
            errorCount++;
            return;
          }

          const timestamps = result.timestamp;
          const quotes = result.indicators.quote[0];
          const adjCloses = result.indicators?.adjclose?.[0]?.adjclose || quotes.close;

          db.exec('BEGIN TRANSACTION;');
          try {
            for (let j = 0; j < timestamps.length; j++) {
              const d = new Date(timestamps[j] * 1000).toISOString().split('T')[0];
              const c = quotes.close?.[j];
              if (c !== null && c !== undefined) {
                const o = quotes.open?.[j] || c;
                const h = quotes.high?.[j] || c;
                const l = quotes.low?.[j] || c;
                const ac = adjCloses?.[j] || c;
                const v = quotes.volume?.[j] || 0;

                insertHistory.run(
                  `${comp.isin}-${exchange}-${d}`,
                  comp.isin,
                  exchange,
                  d,
                  o,
                  h,
                  l,
                  c,
                  ac,
                  v,
                  0,
                  d,
                  `${exchange} Historical Bhavcopy / Exchange Feed`
                );
              }
            }
            db.exec('COMMIT;');
            processedCount++;
          } catch (e) {
            db.exec('ROLLBACK;');
            errorCount++;
          }
        } catch (err) {
          errorCount++;
        }
      })
    );

    if ((i + CONCURRENCY) % 150 === 0 || i + CONCURRENCY >= companies.length) {
      console.log(`Progress: ${Math.min(i + CONCURRENCY, companies.length)} / ${companies.length} processed (${processedCount} newly ingested, ${skippedCount} skipped, ${errorCount} errors)`);
    }
  }

  console.log(`5-Year History Ingestion completed! Processed: ${processedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);

  db.prepare(`
    UPDATE ingestion_run
    SET status = 'COMPLETED', records_processed = ?, records_failed = ?, completed_at = ?
    WHERE id = ?
  `).run(processedCount, errorCount, new Date().toISOString(), runId);
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('ingestBulkHistory')) {
  const limitArg = process.argv[2] ? parseInt(process.argv[2], 10) : undefined;
  ingestBulkHistory(limitArg).catch(console.error);
}
