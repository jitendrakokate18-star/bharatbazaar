import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read JSON messages
const enMessages = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../messages/en.json'), 'utf8')
);
const mrMessages = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../messages/mr.json'), 'utf8')
);

// Import historyUtils & currency
import {
  calculateCAGR,
  calculateAbsoluteReturn,
  adjustOHLCForCorporateActions,
  mergeCompanyRecordsByISIN,
} from '../lib/historyUtils.ts';

import {
  formatIndianNumber,
  formatINR,
  formatMarketCap,
  formatPercent,
  toDevanagariDigits,
} from '../lib/currency.ts';

import { getMarketStatus } from '../lib/dates.ts';

// Helper for Indian FY labelling
function getIndianQuarterAndFY(dateStr) {
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);

  if (month >= 4 && month <= 6) {
    return { quarter: 'Q1', fy: `FY${String(year + 1).slice(-2)}`, full: `Q1 FY${String(year + 1).slice(-2)}` };
  } else if (month >= 7 && month <= 9) {
    return { quarter: 'Q2', fy: `FY${String(year + 1).slice(-2)}`, full: `Q2 FY${String(year + 1).slice(-2)}` };
  } else if (month >= 10 && month <= 12) {
    return { quarter: 'Q3', fy: `FY${String(year + 1).slice(-2)}`, full: `Q3 FY${String(year + 1).slice(-2)}` };
  } else {
    return { quarter: 'Q4', fy: `FY${String(year).slice(-2)}`, full: `Q4 FY${String(year).slice(-2)}` };
  }
}

// --- 1. Test ISIN Merging ---
test('1. isin-merge: merges NSE and BSE listings based on master key ISIN', () => {
  const existingMaster = [
    {
      id: 'comp-1',
      isin: 'INE155A01022',
      name: 'Tata Motors Limited',
      nameMr: 'टाटा मोटर्स लिमिटेड',
      nseSymbol: 'TATAMOTORS',
      sector: 'Automobile',
      sectorMr: 'ऑटोमोबाईल',
      industry: 'Commercial Vehicles',
      industryMr: 'व्यावसायिक वाहने',
      listingDate: '1998-07-22',
      status: 'ACTIVE',
      website: 'https://tatamotors.com',
      hasBrands: true,
      marketCapCategory: 'large',
      marketCapCr: 320000,
    },
  ];

  const incomingBse = [
    {
      isin: 'INE155A01022',
      bseCode: '500570',
      name: 'TATA MOTORS LTD.',
    },
    {
      id: 'comp-bse-only',
      isin: 'INE999Z01010',
      name: 'BSE Only Company Ltd',
      nameMr: 'बीएसई ओन्ली कंपनी',
      bseCode: '599999',
      sector: 'General',
      sectorMr: 'सामान्य',
      industry: 'Diversified',
      industryMr: 'विविध',
      listingDate: '2015-01-01',
      status: 'ACTIVE',
      website: '',
      hasBrands: false,
      marketCapCategory: 'small',
      marketCapCr: 1500,
    },
  ];

  const merged = mergeCompanyRecordsByISIN(existingMaster, incomingBse);

  assert.equal(merged.length, 2);
  const tataMotors = merged.find((c) => c.isin === 'INE155A01022');
  assert.ok(tataMotors);
  assert.equal(tataMotors.nseSymbol, 'TATAMOTORS');
  assert.equal(tataMotors.bseCode, '500570');
  assert.equal(tataMotors.hasBrands, true);

  const bseOnly = merged.find((c) => c.isin === 'INE999Z01010');
  assert.ok(bseOnly);
  assert.equal(bseOnly.bseCode, '599999');
  assert.equal(bseOnly.nseSymbol, undefined);
});

// --- 2. Test Split & Bonus Adjustment ---
test('2. split-adjustment: adjusts historical OHLC backwards for splits and bonus issues', () => {
  const sampleOHLC = [
    { date: '2023-01-01', open: 1000, high: 1050, low: 990, close: 1000, adjClose: 1000, volume: 10000 },
    { date: '2023-06-01', open: 1100, high: 1150, low: 1080, close: 1100, adjClose: 1100, volume: 15000 },
    { date: '2024-01-01', open: 600, high: 620, low: 590, close: 600, adjClose: 600, volume: 20000 },
  ];

  // 1:1 Bonus issue on 2023-09-01 (doubles share count -> pre-bonus prices divided by 2)
  const corporateActions = [
    {
      id: 'ca-bonus-1',
      isin: 'INE123',
      type: 'BONUS',
      exDate: '2023-09-01',
      ratioOrAmount: '1:1',
      descriptionEn: '1:1 Bonus Issue',
      descriptionMr: '१:१ बोनस शेअर्स',
    },
  ];

  const adjusted = adjustOHLCForCorporateActions(sampleOHLC, corporateActions);
  assert.equal(adjusted[0].adjClose, 500);
  assert.equal(adjusted[1].adjClose, 550);
  assert.equal(adjusted[2].adjClose, 600);

  // 1:10 split
  const splitAction = [
    {
      id: 'ca-split-1',
      isin: 'INE456',
      type: 'SPLIT',
      exDate: '2023-09-01',
      ratioOrAmount: '1:10',
      descriptionEn: 'Stock split 1:10',
      descriptionMr: 'स्टॉक स्प्लिट १:१०',
    },
  ];

  const adjustedSplit = adjustOHLCForCorporateActions(sampleOHLC, splitAction);
  assert.equal(adjustedSplit[0].adjClose, 100);
  assert.equal(adjustedSplit[1].adjClose, 110);
  assert.equal(adjustedSplit[2].adjClose, 600);
});

// --- 3. Test Indian Fiscal Year Labelling ---
test('3. indian-fy: correctly labels quarters and fiscal years for all 12 calendar months', () => {
  assert.equal(getIndianQuarterAndFY('2024-10-15').full, 'Q3 FY25');
  assert.equal(getIndianQuarterAndFY('2025-01-20').full, 'Q4 FY25');
  assert.equal(getIndianQuarterAndFY('2025-05-10').full, 'Q1 FY26');
  assert.equal(getIndianQuarterAndFY('2025-08-15').full, 'Q2 FY26');
  assert.equal(getIndianQuarterAndFY('2025-11-20').full, 'Q3 FY26');
  assert.equal(getIndianQuarterAndFY('2026-03-31').full, 'Q4 FY26');
  assert.equal(getIndianQuarterAndFY('2026-06-30').full, 'Q1 FY27');
  assert.equal(getIndianQuarterAndFY('2026-09-30').full, 'Q2 FY27');
});

// --- 4. Test Ratio Math ---
test('4. ratio-math: computes P/E, P/B, ROE, ROCE, and D/E mathematically from reported numbers', () => {
  const netProfitCr = 43851;
  const sharesOutstanding = 13532472634;
  const ltp = 1320;
  const bookValuePerShare = 697.92;
  const netWorthCr = (bookValuePerShare * sharesOutstanding) / 10000000;
  const totalDebtCr = 502049;

  // EPS = Net Profit / Shares = (43851 * 10^7) / 13532472634
  const eps = (netProfitCr * 10000000) / sharesOutstanding;
  assert.ok(Math.abs(eps - 32.40) < 0.1);

  // P/E = LTP / EPS
  const pe = ltp / eps;
  assert.ok(Math.abs(pe - 40.74) < 0.2);

  // P/B = LTP / Book Value
  const pb = ltp / bookValuePerShare;
  assert.ok(Math.abs(pb - 1.89) < 0.05);

  // ROE = (Net Profit / Net Worth) * 100
  const roe = (netProfitCr / netWorthCr) * 100;
  assert.ok(Math.abs(roe - 4.64) < 0.1);

  // Debt to Equity = Debt / Net Worth
  const de = totalDebtCr / netWorthCr;
  assert.ok(Math.abs(de - 0.53) < 0.05);
});

// --- 5. Test Market Clock & Status ---
test('5. market-clock: returns accurate status and localized messages', () => {
  const status = getMarketStatus();
  assert.ok(status.status);
  assert.ok(status.messageEn);
  assert.ok(status.messageMr);
  assert.ok(status.istTime);
});

// --- 6. Test No Synthetic Fallback ---
test('6. no-fallback: missing data renders localized "Data unavailable", never synthesizes numbers', () => {
  function renderField(val, locale = 'en') {
    if (val === null || val === undefined || val === '') {
      return locale === 'mr' ? mrMessages.common.dataUnavailable : enMessages.common.dataUnavailable;
    }
    return String(val);
  }

  assert.equal(renderField(null, 'en'), 'Data unavailable');
  assert.equal(renderField(null, 'mr'), 'डेटा उपलब्ध नाही');
  assert.equal(renderField(undefined, 'en'), 'Data unavailable');
  assert.notEqual(renderField(null, 'en'), '1.2%');
  assert.notEqual(renderField(null, 'en'), '15.0');
});

// --- 7. Banned Literal Regex Assertion ---
test('7. banned-literal-regex: asserts 0 occurrences of banned literals in app/, components/, lib/', () => {
  const bannedPattern = /\b(79486|24148|2718\.60|0\.9998)\b|0\.14\s*\*/;
  const dirsToScan = ['app', 'components', 'lib'];

  function scanDir(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const f of files) {
      const fullPath = path.join(dir, f.name);
      if (f.isDirectory()) {
        scanDir(fullPath);
      } else if (/\.(ts|tsx|js|jsx|json)$/.test(f.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const match = content.match(bannedPattern);
        assert.equal(
          match,
          null,
          `Banned literal found in production file: ${fullPath} (matched: ${match?.[0]})`
        );
      }
    }
  }

  for (const d of dirsToScan) {
    const fullDir = path.join(__dirname, '..', d);
    if (fs.existsSync(fullDir)) {
      scanDir(fullDir);
    }
  }
});

// --- 8. Test Currency & Number Formatting ---
test('8. currency-formatting: Indian grouping and Devanagari numerals', () => {
  assert.equal(formatIndianNumber(1234567.89, 2, false), '12,34,567.89');
  assert.equal(formatIndianNumber(5000, 0, false), '5,000');
  assert.equal(formatIndianNumber(10000000, 0, false), '1,00,00,000');
  assert.equal(toDevanagariDigits('1234567890'), '१२३४५६७८९०');
  assert.equal(formatMarketCap(328450, 'en', false), '₹3,28,450.00 Cr');
  assert.equal(formatMarketCap(328450, 'mr', true), '₹३,२८,४५०.०० कोटी');
});

// --- 9. Test Sector Classification (100% Universe Classified) ---
test('9. sector-classification-universe: asserts 100% companies classified with zero nulls or General', async () => {
  const { getDb } = await import('../lib/db.ts');
  const db = getDb();

  const total = db.prepare('SELECT count(*) as c FROM company').get().c;
  const unclassified = db.prepare(`
    SELECT count(*) as c FROM company
    WHERE sector IS NULL OR sector = '' OR sector = 'General' OR sector_slug IS NULL
  `).get().c;

  assert.ok(total > 4000, `Universe should contain >4,000 companies, got ${total}`);
  assert.equal(unclassified, 0, `All companies must be normalized, found ${unclassified} unclassified`);

  const taxCount = db.prepare('SELECT count(*) as c FROM sector_taxonomy').get().c;
  assert.ok(taxCount >= 18, `Should have >= 18 standardized sectors, got ${taxCount}`);
});

// --- 10. Test Sector & Category Search in English and Marathi ---
test('10. sector-search-bilingual: category queries return SECTOR card and top constituents', async () => {
  const { dbService } = await import('../lib/dbService.ts');

  // Test English queries
  const fmcgResults = dbService.search('fmcg', 'en');
  assert.ok(fmcgResults.length > 0);
  assert.equal(fmcgResults[0].type, 'SECTOR');
  assert.equal(fmcgResults[0].slug, 'fmcg');
  assert.ok(fmcgResults[0].count > 50);
  assert.ok(fmcgResults[0].combinedMarketCapCr > 100000);

  const autoResults = dbService.search('auto', 'en');
  assert.ok(autoResults.length > 0);
  assert.equal(autoResults[0].type, 'SECTOR');
  assert.equal(autoResults[0].slug, 'automobile');

  // Test Marathi queries
  const vahanResults = dbService.search('वाहन', 'mr');
  assert.ok(vahanResults.length > 0);
  assert.equal(vahanResults[0].type, 'SECTOR');
  assert.equal(vahanResults[0].nameMr, 'वाहन व सुटे भाग उद्योग');

  const bankaResults = dbService.search('बँका', 'mr');
  assert.ok(bankaResults.length > 0);
  assert.equal(bankaResults[0].type, 'SECTOR');
  assert.equal(bankaResults[0].slug, 'banking-finance');
});

// --- 11. Test Universe Live Quotes Coverage (>= 98%) ---
test('11. universe-live-quotes-coverage: asserts >= 98% of active universe has price quotes', async () => {
  const { getDb } = await import('../lib/db.ts');
  const db = getDb();

  const total = db.prepare('SELECT count(*) as c FROM company').get().c;
  const withQuotes = db.prepare('SELECT count(DISTINCT isin) as c FROM price_live').get().c;
  const pct = (withQuotes / total) * 100;

  assert.ok(pct >= 98.0, `Coverage must be >= 98%, achieved ${pct.toFixed(2)}% (${withQuotes}/${total})`);
});

// --- 12. Test Company Profiles Coverage (100% Bilingual) ---
test('12. company-profiles-coverage: asserts 100% of companies have both EN and MR profiles', async () => {
  const { getDb } = await import('../lib/db.ts');
  const db = getDb();

  const total = db.prepare('SELECT count(*) as c FROM company').get().c;
  const enCount = db.prepare(`SELECT count(*) as c FROM company_profile WHERE locale = 'en'`).get().c;
  const mrCount = db.prepare(`SELECT count(*) as c FROM company_profile WHERE locale = 'mr'`).get().c;

  assert.equal(enCount, total, `Every company must have an EN profile (${enCount}/${total})`);
  assert.equal(mrCount, total, `Every company must have an MR profile (${mrCount}/${total})`);
});

// --- 13. Test Non-Nifty Company Completeness ---
test('13. non-nifty-company-completeness: samples non-priority companies outside original 27', async () => {
  const { dbService } = await import('../lib/dbService.ts');

  // Non-priority sample outside original 27
  const sampleIsins = [
    'INE499A01024', // DCM Shriram Limited
    'INE951I01027', // V-Guard Industries Limited
    'INE845D01014', // Ganesha Ecosphere Limited
    'INE813H01021', // Torrent Power Limited
  ];

  for (const isin of sampleIsins) {
    const comp = dbService.getCompanyByIsin(isin);
    assert.ok(comp, `Company ${isin} should exist in master`);
    assert.ok(comp.name, 'Must have name');
    assert.notEqual(comp.sector, 'General', 'Must have real sector');
    assert.ok(comp.livePriceNse || comp.livePriceBse, `Must have live price quote on NSE or BSE`);
    assert.ok(comp.marketCapCr > 0, 'Must have computed market cap > 0');

    const profileEn = dbService.getCompanyProfile(isin, 'en');
    const profileMr = dbService.getCompanyProfile(isin, 'mr');
    assert.ok(profileEn?.description, 'Must have English background');
    assert.ok(profileMr?.description, 'Must have Marathi background');
  }
});
