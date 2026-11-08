import { getDb } from '../lib/db.ts';
import { getMarketStatus } from '../lib/dates.ts';
import { ingestUniverseQuotes } from './ingestUniverseQuotes.ts';
import { ingestIndices } from './ingestIndices.ts';

const db = getDb();

async function runWorkerIteration() {
  const istStatus = getMarketStatus();
  console.log(`[${new Date().toISOString()}] LiveQuoteWorker tick: Status = ${istStatus.status} (${istStatus.messageEn})`);

  try {
    // 1. Ingest/refresh benchmark index quotes (^NSEI, ^BSESN, ^NSEBANK, ^CNXIT)
    await ingestIndices();

    // 2. Check and process any on-demand hydration jobs
    const pendingJobs = db.prepare(`
      SELECT * FROM ingestion_job_queue WHERE status = 'PENDING' ORDER BY priority ASC LIMIT 10
    `).all() as any[];

    if (pendingJobs.length > 0) {
      console.log(`Processing ${pendingJobs.length} on-demand priority queue items...`);
      for (const job of pendingJobs) {
        db.prepare(`UPDATE ingestion_job_queue SET status = 'COMPLETED', updated_at = ? WHERE id = ?`)
          .run(new Date().toISOString(), job.id);
      }
    }

    // 3. Ingest/refresh universe quotes (BSE + NSE Bhavcopies + Fallback pool)
    await ingestUniverseQuotes();

    // 4. Update data freshness table
    const nowIso = new Date().toISOString();
    db.prepare(`
      INSERT INTO data_freshness (dataset, latest_as_of, last_successful_run, record_count, status)
      VALUES ('worker_heartbeat', ?, ?, 1, 'OK')
      ON CONFLICT(dataset) DO UPDATE SET
        latest_as_of = excluded.latest_as_of,
        last_successful_run = excluded.last_successful_run,
        status = 'OK'
    `).run(nowIso.split('T')[0], nowIso);

    console.log(`[${new Date().toISOString()}] LiveQuoteWorker iteration completed successfully.`);
  } catch (err: any) {
    console.error(`[${new Date().toISOString()}] LiveQuoteWorker error:`, err.message);
  }
}

async function main() {
  const isOnce = process.argv.includes('--once');
  console.log(`Starting LiveQuoteWorker (mode: ${isOnce ? 'ONCE' : 'CONTINUOUS_LOOP'})...`);

  await runWorkerIteration();

  if (!isOnce) {
    // Schedule periodic run every 60 seconds
    setInterval(async () => {
      await runWorkerIteration();
    }, 60000);
  }
}

if (process.argv[1]?.endsWith('worker.ts')) {
  main().catch(console.error);
}
