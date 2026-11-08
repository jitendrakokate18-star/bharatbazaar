// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dbPath = path.join(process.cwd(), 'market.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Global database instance
let dbInstance: DatabaseSync | null = null;
let schemaInitialized = false;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(dbPath);
    try {
      dbInstance.exec(`
        PRAGMA busy_timeout = 10000;
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
      `);
    } catch (e) {}

    if (!schemaInitialized) {
      try {
        const check = dbInstance.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='company'").get();
        if (!check) {
          initSchema(dbInstance);
        }
        schemaInitialized = true;
      } catch (e) {
        initSchema(dbInstance);
        schemaInitialized = true;
      }
    }
  }
  return dbInstance;
}

export function initSchema(db: DatabaseSync) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;

    -- 1. Company Master
    CREATE TABLE IF NOT EXISTS company (
      id TEXT PRIMARY KEY,
      isin TEXT UNIQUE NOT NULL,
      nse_symbol TEXT,
      bse_code TEXT,
      bse_scrip_id TEXT,
      name TEXT NOT NULL,
      name_mr TEXT,
      sector TEXT,
      sector_mr TEXT,
      sector_slug TEXT,
      industry TEXT,
      industry_mr TEXT,
      series_group TEXT,
      face_value REAL,
      listing_date TEXT,
      status TEXT DEFAULT 'ACTIVE',
      segment TEXT DEFAULT 'MAIN',
      website TEXT,
      logo_url TEXT,
      has_brands INTEGER DEFAULT 0,
      shares_outstanding REAL,
      shares_as_of TEXT,
      market_cap_category TEXT,
      last_traded_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_company_isin ON company(isin);
    CREATE INDEX IF NOT EXISTS idx_company_nse ON company(nse_symbol);
    CREATE INDEX IF NOT EXISTS idx_company_bse ON company(bse_code);
    CREATE INDEX IF NOT EXISTS idx_company_sector ON company(sector);

    -- 2. Company Profile
    CREATE TABLE IF NOT EXISTS company_profile (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      isin TEXT NOT NULL,
      locale TEXT NOT NULL,
      description TEXT,
      history TEXT,
      segments TEXT,
      subsidiaries TEXT,
      management TEXT,
      founded_year INTEGER,
      headquarters TEXT,
      milestones TEXT,
      as_of TEXT NOT NULL,
      source TEXT NOT NULL,
      UNIQUE(isin, locale)
    );

    -- 3. Brand
    CREATE TABLE IF NOT EXISTS brand (
      id TEXT PRIMARY KEY,
      parent_company_id TEXT NOT NULL,
      parent_isin TEXT NOT NULL,
      name TEXT NOT NULL,
      name_mr TEXT,
      category TEXT,
      category_mr TEXT,
      launch_year INTEGER,
      logo_url TEXT,
      owning_entity_id TEXT,
      description_en TEXT,
      description_mr TEXT,
      positioning_en TEXT,
      positioning_mr TEXT,
      key_products_en TEXT,
      key_products_mr TEXT,
      notable_facts_en TEXT,
      notable_facts_mr TEXT,
      as_of TEXT NOT NULL,
      source TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_brand_parent ON brand(parent_company_id);

    -- 4. Live Prices
    CREATE TABLE IF NOT EXISTS price_live (
      id TEXT PRIMARY KEY,
      isin TEXT NOT NULL,
      exchange TEXT NOT NULL,
      ltp REAL NOT NULL,
      change REAL,
      change_pct REAL,
      volume REAL,
      day_high REAL,
      day_low REAL,
      open REAL,
      prev_close REAL,
      fifty_two_week_high REAL,
      fifty_two_week_low REAL,
      quote_time TEXT NOT NULL,
      as_of TEXT NOT NULL,
      source TEXT NOT NULL,
      delayed INTEGER DEFAULT 1,
      is_stale INTEGER DEFAULT 0,
      UNIQUE(isin, exchange)
    );
    CREATE INDEX IF NOT EXISTS idx_price_live_isin ON price_live(isin);

    -- 5. Price History (OHLCV)
    CREATE TABLE IF NOT EXISTS price_history (
      id TEXT PRIMARY KEY,
      isin TEXT NOT NULL,
      exchange TEXT NOT NULL,
      date TEXT NOT NULL,
      open REAL,
      high REAL,
      low REAL,
      close REAL NOT NULL,
      adj_close REAL NOT NULL,
      volume REAL,
      delivery_pct REAL,
      as_of TEXT NOT NULL,
      source TEXT NOT NULL,
      UNIQUE(isin, exchange, date)
    );
    CREATE INDEX IF NOT EXISTS idx_price_hist_lookup ON price_history(isin, exchange, date);

    -- 6. Index Quote
    CREATE TABLE IF NOT EXISTS index_quote (
      symbol TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_mr TEXT NOT NULL,
      ltp REAL NOT NULL,
      change REAL NOT NULL,
      change_pct REAL NOT NULL,
      high REAL,
      low REAL,
      prev_close REAL,
      quote_time TEXT NOT NULL,
      as_of TEXT NOT NULL,
      source TEXT NOT NULL,
      delayed INTEGER DEFAULT 1
    );

    -- 7. Index History
    CREATE TABLE IF NOT EXISTS index_history (
      id TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      date TEXT NOT NULL,
      open REAL,
      high REAL,
      low REAL,
      close REAL NOT NULL,
      adj_close REAL NOT NULL,
      volume REAL,
      as_of TEXT NOT NULL,
      source TEXT NOT NULL,
      UNIQUE(symbol, date)
    );
    CREATE INDEX IF NOT EXISTS idx_index_hist ON index_history(symbol, date);

    -- 8. Annual Financials
    CREATE TABLE IF NOT EXISTS financials_annual (
      id TEXT PRIMARY KEY,
      isin TEXT NOT NULL,
      period TEXT NOT NULL,
      fiscal_year INTEGER NOT NULL,
      period_end_date TEXT NOT NULL,
      revenue_cr REAL,
      op_profit_cr REAL,
      op_margin_pct REAL,
      net_profit_cr REAL,
      eps REAL,
      total_debt_cr REAL,
      net_worth_cr REAL,
      is_consolidated INTEGER DEFAULT 1,
      as_of TEXT NOT NULL,
      source TEXT NOT NULL,
      UNIQUE(isin, period)
    );
    CREATE INDEX IF NOT EXISTS idx_fin_ann ON financials_annual(isin, fiscal_year);

    -- 9. Quarterly Financials
    CREATE TABLE IF NOT EXISTS financials_quarterly (
      id TEXT PRIMARY KEY,
      isin TEXT NOT NULL,
      quarter_label TEXT NOT NULL,
      period_end_date TEXT NOT NULL,
      revenue_cr REAL,
      op_profit_cr REAL,
      op_margin_pct REAL,
      net_profit_cr REAL,
      eps REAL,
      total_debt_cr REAL,
      net_worth_cr REAL,
      is_consolidated INTEGER DEFAULT 1,
      as_of TEXT NOT NULL,
      source TEXT NOT NULL,
      UNIQUE(isin, quarter_label)
    );
    CREATE INDEX IF NOT EXISTS idx_fin_qtr ON financials_quarterly(isin, period_end_date);

    -- 10. Valuation Ratios
    CREATE TABLE IF NOT EXISTS ratios (
      id TEXT PRIMARY KEY,
      isin TEXT NOT NULL,
      period TEXT NOT NULL,
      pe_ttm REAL,
      pe_annual REAL,
      pb REAL,
      roe REAL,
      roce REAL,
      debt_to_equity REAL,
      interest_coverage REAL,
      dividend_payout_pct REAL,
      dividend_yield REAL,
      eps_growth REAL,
      as_of TEXT NOT NULL,
      source TEXT NOT NULL,
      UNIQUE(isin, period)
    );
    CREATE INDEX IF NOT EXISTS idx_ratios_isin ON ratios(isin);

    -- 11. Shareholding Pattern
    CREATE TABLE IF NOT EXISTS shareholding (
      id TEXT PRIMARY KEY,
      isin TEXT NOT NULL,
      quarter_label TEXT NOT NULL,
      period_end_date TEXT NOT NULL,
      promoter REAL,
      fii REAL,
      dii REAL,
      public REAL,
      pledge_pct REAL,
      as_of TEXT NOT NULL,
      source TEXT NOT NULL,
      UNIQUE(isin, quarter_label)
    );
    CREATE INDEX IF NOT EXISTS idx_shareholding_isin ON shareholding(isin);

    -- 12. Corporate Actions
    CREATE TABLE IF NOT EXISTS corporate_action (
      id TEXT PRIMARY KEY,
      isin TEXT NOT NULL,
      type TEXT NOT NULL,
      ex_date TEXT NOT NULL,
      record_date TEXT,
      ratio_or_amount TEXT NOT NULL,
      description_en TEXT,
      description_mr TEXT,
      as_of TEXT NOT NULL,
      source TEXT NOT NULL,
      UNIQUE(isin, type, ex_date, ratio_or_amount)
    );
    CREATE INDEX IF NOT EXISTS idx_corp_action_isin ON corporate_action(isin, ex_date);

    -- 13. Market Holiday
    CREATE TABLE IF NOT EXISTS market_holiday (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      holiday_name TEXT NOT NULL,
      holiday_name_mr TEXT NOT NULL,
      exchange TEXT NOT NULL,
      UNIQUE(date, exchange)
    );

    -- 14. Ingestion Runs
    CREATE TABLE IF NOT EXISTS ingestion_run (
      id TEXT PRIMARY KEY,
      job_name TEXT NOT NULL,
      status TEXT NOT NULL,
      records_processed INTEGER DEFAULT 0,
      records_failed INTEGER DEFAULT 0,
      error_message TEXT,
      started_at TEXT NOT NULL,
      completed_at TEXT
    );

    -- 15. Data Freshness
    CREATE TABLE IF NOT EXISTS data_freshness (
      dataset TEXT PRIMARY KEY,
      latest_as_of TEXT,
      last_successful_run TEXT,
      last_error TEXT,
      record_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'OK'
    );

    -- 16. Sector & Category Taxonomy
    CREATE TABLE IF NOT EXISTS sector_taxonomy (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name_en TEXT NOT NULL,
      name_mr TEXT NOT NULL,
      aliases_en TEXT,
      aliases_mr TEXT,
      description_en TEXT,
      description_mr TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_sector_slug ON sector_taxonomy(slug);

    -- 17. Symbol Mapping Issues
    CREATE TABLE IF NOT EXISTS mapping_issues (
      id TEXT PRIMARY KEY,
      isin TEXT NOT NULL,
      symbol TEXT,
      exchange TEXT NOT NULL,
      error_reason TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    -- 18. Ingestion Job Queue
    CREATE TABLE IF NOT EXISTS ingestion_job_queue (
      id TEXT PRIMARY KEY,
      isin TEXT NOT NULL,
      job_type TEXT NOT NULL,
      priority INTEGER DEFAULT 10,
      status TEXT DEFAULT 'PENDING',
      attempts INTEGER DEFAULT 0,
      last_error TEXT,
      next_run_at TEXT,
      updated_at TEXT NOT NULL,
      UNIQUE(isin, job_type)
    );
    CREATE INDEX IF NOT EXISTS idx_job_queue_status ON ingestion_job_queue(job_type, status, priority);
  `);

  // Safe incremental column additions for existing SQLite database
  try { db.exec(`ALTER TABLE company ADD COLUMN sector_slug TEXT;`); } catch (_) {}
  try { db.exec(`ALTER TABLE company ADD COLUMN segment TEXT DEFAULT 'MAIN';`); } catch (_) {}
  try { db.exec(`ALTER TABLE company ADD COLUMN last_traded_date TEXT;`); } catch (_) {}
  try { db.exec(`CREATE INDEX IF NOT EXISTS idx_company_sector_slug ON company(sector_slug);`); } catch (_) {}
  try { db.exec(`CREATE INDEX IF NOT EXISTS idx_company_status ON company(status);`); } catch (_) {}
}
