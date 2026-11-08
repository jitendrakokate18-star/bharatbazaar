import { ingestMaster } from './ingestMaster.ts';
import { runClassification } from './classifyCompanies.ts';
import { ingestUniverseQuotes } from './ingestUniverseQuotes.ts';
import { ingestIndices } from './ingestIndices.ts';
import { ingestProfiles } from './ingestProfiles.ts';
import { ingestBulkHistory } from './ingestBulkHistory.ts';
import { ingestHolidays } from './ingestHolidays.ts';

export async function ingestAll() {
  const startedAt = new Date().toISOString();
  console.log(`=================================================================`);
  console.log(`[${startedAt}] STARTING UNIFIED INGESTION PIPELINE (ALL DATASETS)`);
  console.log(`=================================================================`);

  try {
    console.log('\n>>> STEP 1: Company Master (BSE + NSE)');
    await ingestMaster();

    console.log('\n>>> STEP 2: Sector Taxonomy & Classification (100% Classified)');
    await runClassification();

    console.log('\n>>> STEP 3: Universe Live Delayed Quotes & Daily OHLC');
    await ingestUniverseQuotes();

    console.log('\n>>> STEP 4: Market Indices (Nifty 50 & Sensex)');
    await ingestIndices();

    console.log('\n>>> STEP 5: Bilingual Company Profiles');
    await ingestProfiles();

    console.log('\n>>> STEP 6: Historical OHLCV (Top Universe Backfill)');
    await ingestBulkHistory(150);

    console.log('\n>>> STEP 7: Market Holidays');
    await ingestHolidays();

    console.log(`\n=================================================================`);
    console.log(`[${new Date().toISOString()}] UNIFIED INGESTION COMPLETED SUCCESSFULLY`);
    console.log(`=================================================================`);
  } catch (err: any) {
    console.error(`Unified ingestion failed:`, err);
    process.exit(1);
  }
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('ingestAll')) {
  ingestAll().catch(console.error);
}
