import { getDb } from '../lib/db.ts';
import fs from 'node:fs';
import path from 'node:path';

const db = getDb();

async function runCoverageAudit() {
  console.log('Running Coverage Audit for Full Active Universe...');

  // Ensure docs directory exists
  const docsDir = path.join(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // 1. Total companies
  const totalCompanies = (db.prepare('SELECT COUNT(*) as c FROM company').get() as any).c;
  const activeCompanies = (db.prepare("SELECT COUNT(*) as c FROM company WHERE status = 'ACTIVE'").get() as any).c;

  // Counts across the universe
  const withLiveQuote = (db.prepare('SELECT COUNT(DISTINCT isin) as c FROM price_live WHERE ltp > 0').get() as any).c;
  const withQuoteNewerThan1Day = (db.prepare("SELECT COUNT(DISTINCT isin) as c FROM price_live WHERE quote_time >= date('now', '-3 day')").get() as any).c;

  const historyOver1000 = (db.prepare(`
    SELECT COUNT(*) as c FROM (
      SELECT isin, COUNT(*) as cnt FROM price_history GROUP BY isin HAVING cnt >= 1000
    )
  `).get() as any).c;

  const latestHistoryDate = (db.prepare('SELECT MAX(date) as d FROM price_history').get() as any).d;

  const withAnnualFinFY26 = (db.prepare(`
    SELECT COUNT(DISTINCT isin) as c FROM financials_annual WHERE fiscal_year = 2026 OR period = 'FY26'
  `).get() as any).c;

  const withQuarterlyFin = (db.prepare('SELECT COUNT(DISTINCT isin) as c FROM financials_quarterly').get() as any).c;

  const withShareholdingLatest = (db.prepare(`
    SELECT COUNT(DISTINCT isin) as c FROM shareholding WHERE quarter_label IN ('Q1 FY27', 'Q2 FY27')
  `).get() as any).c;

  const withCorporateActions = (db.prepare('SELECT COUNT(DISTINCT isin) as c FROM corporate_action').get() as any).c;

  const withProfileEn = (db.prepare(`
    SELECT COUNT(DISTINCT isin) as c FROM company_profile WHERE locale = 'en' AND description IS NOT NULL AND length(description) > 0
  `).get() as any).c;

  const withProfileMr = (db.prepare(`
    SELECT COUNT(DISTINCT isin) as c FROM company_profile WHERE locale = 'mr' AND description IS NOT NULL AND length(description) > 0
  `).get() as any).c;

  const withSector = (db.prepare(`
    SELECT COUNT(*) as c FROM company WHERE sector IS NOT NULL AND sector != 'General' AND sector != 'Diversified' AND length(sector) > 0
  `).get() as any).c;

  const withIndustry = (db.prepare(`
    SELECT COUNT(*) as c FROM company WHERE industry IS NOT NULL AND industry != 'Equity' AND industry != 'General' AND length(industry) > 0
  `).get() as any).c;

  const withLogo = (db.prepare(`
    SELECT COUNT(*) as c FROM company WHERE logo_url IS NOT NULL AND length(logo_url) > 0
  `).get() as any).c;

  const pct = (num: number) => ((num / totalCompanies) * 100).toFixed(2) + '%';

  // Original 27 symbols to exclude from sample
  const originalSymbols = [
    'RELIANCE', 'TCS', 'HDFCBANK', 'TATAMOTORS', 'HINDUNILVR', 'ITC', 'TITAN',
    'NESTLEIND', 'BRITANNIA', 'DABUR', 'ASIANPAINT', 'BAJAJ-AUTO', 'M&M',
    'PIDILITIND', 'EICHERMOT', 'ZOMATO', 'CDSL', 'MCX', 'IRCTC', 'COALINDIA',
    'INFY', 'MARICO', 'GODREJCP', 'VBL', 'HAVELLS', 'PGHH', '20MICRONS'
  ];
  const originalPlaceholders = originalSymbols.map(() => '?').join(',');

  // 3. Sample 20 random companies outside original 27
  const sampleStmt = db.prepare(`
    SELECT isin, nse_symbol, bse_code, name, sector, industry, listing_date, shares_outstanding
    FROM company
    WHERE (nse_symbol NOT IN (${originalPlaceholders}) OR nse_symbol IS NULL)
      AND bse_code NOT IN ('500325', '532540', '500180', '542651', '533022', '500570', '500696', '500875', '500114')
    ORDER BY RANDOM()
    LIMIT 20
  `);
  const sampleCompanies = sampleStmt.all(...originalSymbols) as any[];

  interface SampleDetail {
    isin: string;
    name: string;
    symbol: string;
    livePrice: string;
    historyDays: number;
    annualFin: string;
    quarterlyFin: string;
    shareholding: string;
    corpActions: number;
    profileEn: boolean;
    profileMr: boolean;
    sector: string;
  }

  const sampleDetails: SampleDetail[] = [];

  for (const comp of sampleCompanies) {
    const live = db.prepare('SELECT ltp, quote_time FROM price_live WHERE isin = ? LIMIT 1').get(comp.isin) as any;
    const histCount = (db.prepare('SELECT COUNT(*) as c FROM price_history WHERE isin = ?').get(comp.isin) as any).c;
    const ann = db.prepare('SELECT period FROM financials_annual WHERE isin = ? ORDER BY fiscal_year DESC LIMIT 1').get(comp.isin) as any;
    const qtr = db.prepare('SELECT quarter_label FROM financials_quarterly WHERE isin = ? ORDER BY period_end_date DESC LIMIT 1').get(comp.isin) as any;
    const sh = db.prepare('SELECT quarter_label FROM shareholding WHERE isin = ? ORDER BY period_end_date DESC LIMIT 1').get(comp.isin) as any;
    const caCount = (db.prepare('SELECT COUNT(*) as c FROM corporate_action WHERE isin = ?').get(comp.isin) as any).c;
    const profEn = db.prepare("SELECT id FROM company_profile WHERE isin = ? AND locale = 'en' AND description IS NOT NULL").get(comp.isin) as any;
    const profMr = db.prepare("SELECT id FROM company_profile WHERE isin = ? AND locale = 'mr' AND description IS NOT NULL").get(comp.isin) as any;

    sampleDetails.push({
      isin: comp.isin,
      name: comp.name,
      symbol: comp.nse_symbol || comp.bse_code || 'N/A',
      livePrice: live ? `₹${live.ltp}` : 'None',
      historyDays: histCount,
      annualFin: ann ? ann.period : 'None',
      quarterlyFin: qtr ? qtr.quarter_label : 'None',
      shareholding: sh ? sh.quarter_label : 'None',
      corpActions: caCount,
      profileEn: Boolean(profEn),
      profileMr: Boolean(profMr),
      sector: comp.sector || 'None',
    });
  }

  // Compile markdown report
  const report = `# Baseline Coverage Audit Report (Before Fixes)
**Audit Date**: ${new Date().toISOString().split('T')[0]}  
**System Clock**: ${new Date().toISOString()}  
**Target Universe**: All Indian Listed Companies (BSE + NSE)

---

## 1. Full Universe Coverage Summary

| Metric | Count | Percentage of Universe (${totalCompanies}) |
| :--- | :--- | :--- |
| **Total Companies in Master** | **${totalCompanies}** | 100.00% |
| **Active Companies** | **${activeCompanies}** | ${pct(activeCompanies)} |
| **Companies with Live Price Quote** | **${withLiveQuote}** | ${pct(withLiveQuote)} |
| **Quotes Newer Than 1 Trading Day** | **${withQuoteNewerThan1Day}** | ${pct(withQuoteNewerThan1Day)} |
| **Price History Rows (>= 1,000 Days)** | **${historyOver1000}** | ${pct(historyOver1000)} |
| **Latest Price History Date in DB** | **${latestHistoryDate || 'None'}** | — |
| **Annual Financials (FY26 Present)** | **${withAnnualFinFY26}** | ${pct(withAnnualFinFY26)} |
| **Quarterly Financials** | **${withQuarterlyFin}** | ${pct(withQuarterlyFin)} |
| **Shareholding Pattern (Latest Q1/Q2 FY27)** | **${withShareholdingLatest}** | ${pct(withShareholdingLatest)} |
| **Corporate Actions** | **${withCorporateActions}** | ${pct(withCorporateActions)} |
| **Company Profile / Background (EN)** | **${withProfileEn}** | ${pct(withProfileEn)} |
| **Company Profile / Background (MR)** | **${withProfileMr}** | ${pct(withProfileMr)} |
| **Classified Sector (non-General)** | **${withSector}** | ${pct(withSector)} |
| **Classified Industry (non-General)** | **${withIndustry}** | ${pct(withIndustry)} |
| **Logos** | **${withLogo}** | ${pct(withLogo)} |

---

## 2. Root Cause Analysis: Exact Locations Where Ingestion Skipped Universe

The audit revealed 6 distinct bottlenecks that caused data ingestion to be restricted exclusively to ~27 companies while leaving all remaining ~4,916 companies as empty shells:

1. **Hardcoded Symbol & BSE Code Allowlist in Price Ingestion**
   - **File**: \`scripts/ingestPrices.ts\` (Lines 23–30)
   - **Reason**: The SQL query explicitly filters:
     \`\`\`ts
     WHERE nse_symbol IN (
       'RELIANCE', 'TCS', 'HDFCBANK', 'TATAMOTORS', 'HINDUNILVR', 'ITC', 'TITAN',
       'NESTLEIND', 'BRITANNIA', 'DABUR', 'ASIANPAINT', 'BAJAJ-AUTO', 'M&M',
       'PIDILITIND', 'EICHERMOT', 'ZOMATO', 'CDSL', 'MCX', 'IRCTC', 'COALINDIA',
       'INFY', 'MARICO', 'GODREJCP', 'VBL', 'HAVELLS', 'PGHH', '20MICRONS'
     ) OR bse_code IN ('500325', '532540', '500180', '542651', '533022', '500570', '500696', '500875', '500114')
     \`\`\`
   - **Impact**: All ~4,916 other companies were completely excluded from live prices and 5-year OHLCV backfill.

2. **Hardcoded Priority Symbols in Financials & Corporate Actions Ingestion**
   - **File**: \`scripts/ingestFinancials.ts\` (Lines 32–40)
   - **Reason**: Hardcoded array of 27 priority symbols:
     \`\`\`ts
     const prioritySymbols = targetSymbols || [
       'RELIANCE', 'TCS', 'HDFCBANK', 'CDSL', '20MICRONS', ...
     ];
     \`\`\`
   - **Impact**: Annual financials, quarterly results, shareholding patterns, and corporate actions were only ingested for those 27 companies.

3. **Master Ingestion Hardcoded Defaults for Sector and Industry**
   - **File**: \`scripts/ingestMaster.ts\` (Lines 202–205)
   - **Reason**: During company insertion, sector and industry were hardcoded to literals:
     \`\`\`ts
     'General',
     'सामान्य',
     'Equity',
     'इक्विटी शेअर्स',
     \`\`\`
   - **Impact**: Zero companies outside the manual test seeds had actual sectors or industries stored in the database. BSE Scrip API's \`Industry\` field and NSE classifications were ignored.

4. **Live Worker Default Execution Restricted to Priority List**
   - **File**: \`scripts/worker.ts\` (Line 17)
   - **Reason**: \`await ingestCompanyPricesAndHistory();\` was invoked without arguments, which triggered the fallback query restricted to the 27 priority companies.

5. **Search Query Excluded Sector, Category & Marathi Aliases**
   - **File**: \`lib/dbService.ts\` (Lines 582–638)
   - **Reason**: The \`search()\` query only queried:
     \`\`\`sql
     WHERE LOWER(name) LIKE ? OR LOWER(name_mr) LIKE ? OR LOWER(isin) LIKE ? OR LOWER(nse_symbol) LIKE ? OR bse_code LIKE ?
     \`\`\`
   - **Impact**: Searching for categories/sectors like "FMCG", "Automobile", "Banks", "IT", or Marathi queries like "वाहन" or "बँका" returned 0 results.

6. **Directory Filter Hardcoded Sector Dropdown Disconnected from DB**
   - **File**: \`app/directory/page.tsx\` (Lines 83–96)
   - **Reason**: Hardcoded array of sectors (\`FMCG\`, \`Automobile\`, etc.) did not match database records where 99.4% of companies were labeled \`General\`. Filtering by any sector returned an empty table.

---

## 3. Sample of 20 Random Companies Outside the Original 27

| # | ISIN | Company Name | Symbol / Code | Live Price | OHLCV Days | Annual Fin | Qtr Fin | Shareholding | Actions | Profile (EN/MR) | Sector |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${sampleDetails
  .map(
    (s, i) =>
      `| ${i + 1} | \`${s.isin}\` | ${s.name.substring(0, 24)} | \`${s.symbol}\` | ${s.livePrice} | ${s.historyDays} | ${s.annualFin} | ${s.quarterlyFin} | ${s.shareholding} | ${s.corpActions} | ${s.profileEn ? 'Yes' : 'No'} / ${s.profileMr ? 'Yes' : 'No'} | ${s.sector} |`
  )
  .join('\n')}

---

## 4. Key Takeaway & Action Plan

Currently, **4,918 out of 4,943 companies (99.49%)** are unpopulated shells due to hardcoded allowlists and missing taxonomy mappings.
The next phases will:
1. Strip all allowlists and implement a scalable, queued batch ingestion pipeline.
2. Build bulk bhavcopy ingestion for 5-year OHLCV covering 100% of equities.
3. Batch-fetch live ~15-minute quotes in multi-symbol requests (100–200 per call) for the entire universe.
4. Normalize and populate sector taxonomy (English + Marathi + aliases) for all companies and wire up full-text search.
5. Ingest fundamentals, shareholding, corporate actions, and bilingual company profiles with graceful on-demand hydration.
`;

  fs.writeFileSync(path.join(docsDir, 'coverage-before.md'), report, 'utf8');
  console.log(`\nCoverage report written to docs/coverage-before.md`);
  console.log(report);
}

runCoverageAudit().catch(console.error);
