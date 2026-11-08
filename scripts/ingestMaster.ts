import { getDb } from '../lib/db.ts';

interface NseRow {
  symbol: string;
  name: string;
  series: string;
  listingDate: string;
  isin: string;
  faceValue: number;
}

interface BseRow {
  scripCode: string;
  scripId: string;
  name: string;
  group: string;
  faceValue: number;
  isin: string;
}

export async function ingestMaster() {
  const db = getDb();
  const startedAt = new Date().toISOString();
  console.log(`[${startedAt}] Starting Company Master Ingestion (NSE + BSE)...`);

  const runId = `run-master-${Date.now()}`;
  db.prepare(`
    INSERT INTO ingestion_run (id, job_name, status, records_processed, records_failed, started_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(runId, 'ingest:master', 'RUNNING', 0, 0, startedAt);

  const nseCompanies = new Map<string, NseRow>();
  const bseCompanies = new Map<string, BseRow>();

  // 1. Fetch NSE Equity List
  try {
    console.log('Fetching official NSE Equity List (EQUITY_L.csv)...');
    const nseUrl = process.env.NSE_EQUITY_URL || 'https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv';
    const res = await fetch(nseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!res.ok) {
      throw new Error(`NSE download returned status ${res.status}`);
    }

    const csvText = await res.text();
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Parse CSV line handling potential quotes
      const cols: string[] = [];
      let inQuotes = false;
      let curr = '';
      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
          cols.push(curr.trim());
          curr = '';
        } else {
          curr += char;
        }
      }
      cols.push(curr.trim());

      if (cols.length >= 8) {
        const symbol = cols[0];
        const name = cols[1];
        const series = cols[2];
        const listingDate = cols[3];
        const isin = cols[6];
        const faceValue = parseFloat(cols[7]) || 1;

        if (isin && isin.startsWith('INE') && series === 'EQ') {
          nseCompanies.set(isin, {
            symbol,
            name,
            series,
            listingDate,
            isin,
            faceValue,
          });
        }
      }
    }
    console.log(`Loaded ${nseCompanies.size} active equity records from NSE.`);
  } catch (err: any) {
    console.warn(`Warning: NSE Equity fetch failed: ${err.message}. Proceeding with BSE.`);
  }

  // 2. Fetch BSE Scrip Master
  try {
    console.log('Fetching official BSE Scrip Master API...');
    const bseUrl =
      process.env.BSE_SCRIP_URL ||
      'https://api.bseindia.com/BseIndiaAPI/api/ListofScripData/w?Group=&Scrip_code=&industry=&segment=Equity&status=Active';

    const res = await fetch(bseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.bseindia.com/',
      },
    });

    if (!res.ok) {
      throw new Error(`BSE API returned status ${res.status}`);
    }

    const data = await res.json();
    if (Array.isArray(data)) {
      for (const item of data) {
        const isin = item.ISIN_NUMBER;
        const scripCode = item.SCRIP_CD;
        const scripId = item.scrip_id;
        const name = item.Issuer_Name || item.Scrip_Name;
        const group = item.GROUP || '';
        const faceValue = parseFloat(item.FACE_VALUE) || 1;

        if (isin && isin.startsWith('INE') && item.Segment === 'Equity' && item.Status === 'Active') {
          bseCompanies.set(isin, {
            scripCode,
            scripId,
            name,
            group,
            faceValue,
            isin,
          });
        }
      }
      console.log(`Loaded ${bseCompanies.size} active equity records from BSE.`);
    }
  } catch (err: any) {
    console.warn(`Warning: BSE Scrip fetch failed: ${err.message}.`);
  }

  // 3. Merge by unique ISIN
  const allIsins = new Set<string>([...nseCompanies.keys(), ...bseCompanies.keys()]);
  console.log(`Merging into single master: ${allIsins.size} unique companies across BSE & NSE...`);

  let countBoth = 0;
  let countNseOnly = 0;
  let countBseOnly = 0;

  const insertStmt = db.prepare(`
    INSERT INTO company (
      id, isin, nse_symbol, bse_code, bse_scrip_id, name, name_mr,
      sector, sector_mr, industry, industry_mr, series_group, face_value,
      listing_date, status, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?
    )
    ON CONFLICT(isin) DO UPDATE SET
      nse_symbol = coalesce(excluded.nse_symbol, company.nse_symbol),
      bse_code = coalesce(excluded.bse_code, company.bse_code),
      bse_scrip_id = coalesce(excluded.bse_scrip_id, company.bse_scrip_id),
      name = excluded.name,
      series_group = excluded.series_group,
      face_value = excluded.face_value,
      updated_at = excluded.updated_at
  `);

  const now = new Date().toISOString();

  // Begin transaction
  db.exec('BEGIN TRANSACTION;');
  try {
    for (const isin of allIsins) {
      const nse = nseCompanies.get(isin);
      const bse = bseCompanies.get(isin);

      if (nse && bse) countBoth++;
      else if (nse) countNseOnly++;
      else if (bse) countBseOnly++;

      const nseSymbol = nse ? nse.symbol : null;
      const bseCode = bse ? bse.scripCode : null;
      const bseScripId = bse ? bse.scripId : null;
      const name = nse ? nse.name : bse ? bse.name : isin;
      const seriesGroup = [nse?.series, bse?.group].filter(Boolean).join(' / ');
      const faceValue = nse?.faceValue || bse?.faceValue || 1;
      const listingDate = nse?.listingDate || '';

      const id = isin.toLowerCase();

      insertStmt.run(
        id,
        isin,
        nseSymbol,
        bseCode,
        bseScripId,
        name,
        name, // Name defaults to English; transliterations populated as available
        'General',
        'सामान्य',
        'Equity',
        'इक्विटी शेअर्स',
        seriesGroup,
        faceValue,
        listingDate,
        'ACTIVE',
        now,
        now
      );
    }
    db.exec('COMMIT;');
  } catch (err: any) {
    db.exec('ROLLBACK;');
    throw err;
  }

  // Update Ingestion Run & Freshness
  const completedAt = new Date().toISOString();
  db.prepare(`
    UPDATE ingestion_run
    SET status = 'SUCCESS', records_processed = ?, completed_at = ?
    WHERE id = ?
  `).run(allIsins.size, completedAt, runId);

  db.prepare(`
    INSERT INTO data_freshness (dataset, latest_as_of, last_successful_run, record_count, status)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(dataset) DO UPDATE SET
      latest_as_of = excluded.latest_as_of,
      last_successful_run = excluded.last_successful_run,
      record_count = excluded.record_count,
      status = excluded.status
  `).run('company_master', completedAt, completedAt, allIsins.size, 'OK');

  console.log(`\n========================================`);
  console.log(`COMPANY MASTER INGESTION COMPLETE`);
  console.log(`Total Unique Companies: ${allIsins.size}`);
  console.log(`Dual-listed (BSE + NSE): ${countBoth}`);
  console.log(`NSE Only:               ${countNseOnly}`);
  console.log(`BSE Only:               ${countBseOnly}`);
  console.log(`========================================\n`);

  return {
    total: allIsins.size,
    both: countBoth,
    nseOnly: countNseOnly,
    bseOnly: countBseOnly,
  };
}

if (process.argv[1]?.includes('ingestMaster')) {
  ingestMaster().catch(console.error);
}
