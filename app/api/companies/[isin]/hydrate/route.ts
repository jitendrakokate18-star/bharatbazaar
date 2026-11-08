import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ isin: string }> }
) {
  try {
    const { isin } = await params;
    const db = getDb();

    const company = db.prepare('SELECT isin, nse_symbol, bse_code, bse_scrip_id FROM company WHERE isin = ?').get(isin) as any;
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Check if job already pending
    const existing = db.prepare('SELECT * FROM ingestion_job_queue WHERE isin = ? AND job_type = ?').get(isin, 'hydrate') as any;
    if (!existing) {
      db.prepare(`
        INSERT INTO ingestion_job_queue (id, isin, job_type, priority, status, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(`job-${isin}-${Date.now()}`, isin, 'hydrate', 1, 'RUNNING', new Date().toISOString());
    }

    // Trigger non-blocking async hydration if ticker available
    const ticker = company.nse_symbol
      ? `${company.nse_symbol}.NS`
      : company.bse_scrip_id
      ? `${company.bse_scrip_id}.BO`
      : company.bse_code
      ? `${company.bse_code}.BO`
      : null;

    if (ticker) {
      // Fire-and-forget hydration
      (async () => {
        try {
          const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=5y&interval=1d`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
          });
          if (res.ok) {
            const data = await res.json();
            const result = data?.chart?.result?.[0];
            if (result?.timestamp && result?.indicators?.quote?.[0]) {
              const timestamps = result.timestamp;
              const quotes = result.indicators.quote[0];
              const exchange = company.nse_symbol ? 'NSE' : 'BSE';

              const insertHist = db.prepare(`
                INSERT INTO price_history (id, isin, exchange, date, open, high, low, close, adj_close, volume, delivery_pct, as_of, source)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(isin, exchange, date) DO NOTHING
              `);

              db.exec('BEGIN TRANSACTION;');
              try {
                for (let i = 0; i < timestamps.length; i++) {
                  const d = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
                  const c = quotes.close?.[i];
                  if (c !== null && c !== undefined) {
                    insertHist.run(
                      `${isin}-${exchange}-${d}`,
                      isin,
                      exchange,
                      d,
                      quotes.open?.[i] || c,
                      quotes.high?.[i] || c,
                      quotes.low?.[i] || c,
                      c,
                      c,
                      quotes.volume?.[i] || 0,
                      0,
                      d,
                      'On-Demand Hydration Feed'
                    );
                  }
                }
                db.exec('COMMIT;');
              } catch (_) {
                db.exec('ROLLBACK;');
              }
            }
          }
          db.prepare(`UPDATE ingestion_job_queue SET status = 'COMPLETED', updated_at = ? WHERE isin = ? AND job_type = ?`)
            .run(new Date().toISOString(), isin, 'hydrate');
        } catch (_) {
          db.prepare(`UPDATE ingestion_job_queue SET status = 'FAILED', updated_at = ? WHERE isin = ? AND job_type = ?`)
            .run(new Date().toISOString(), isin, 'hydrate');
        }
      })();
    }

    return NextResponse.json({
      status: 'HYDRATING',
      isin,
      message: 'On-demand background hydration triggered successfully.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
