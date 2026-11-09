import { prisma } from '../lib/prisma.ts';
import { getMarketStatus } from '../lib/dates.ts';
import { ingestUniverseQuotes } from './ingestUniverseQuotes.ts';
import { ingestIndices } from './ingestIndices.ts';

async function runWorkerIteration() {
  const istStatus = getMarketStatus();
  console.log(`[${new Date().toISOString()}] LiveQuoteWorker tick: Status = ${istStatus.status} (${istStatus.messageEn})`);

  try {
    // 1. Ingest/refresh benchmark index quotes (^NSEI, ^BSESN, ^NSEBANK, ^CNXIT)
    await ingestIndices(false); // only quotes in fast loop

    // 2. Ingest/refresh universe quotes (BSE + NSE Bhavcopies + Fallback pool)
    await ingestUniverseQuotes();

    // 3. Update data freshness table
    const nowIso = new Date().toISOString();
    await prisma.dataFreshness.upsert({
      where: { dataset: 'worker_heartbeat' },
      create: {
        dataset: 'worker_heartbeat',
        latestAsOf: nowIso.split('T')[0],
        lastSuccessfulRun: nowIso,
        recordCount: 1,
        status: 'OK',
      },
      update: {
        latestAsOf: nowIso.split('T')[0],
        lastSuccessfulRun: nowIso,
        status: 'OK',
      },
    });

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

if (process.argv[1]?.endsWith('worker.ts') || process.argv[1]?.endsWith('worker.js')) {
  main().catch(console.error);
}
