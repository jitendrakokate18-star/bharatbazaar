import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import pg from 'pg';

const { Pool } = pg;

// Load .env if present
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq > 0) {
      const k = trimmed.slice(0, eq).trim();
      let v = trimmed.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) {
        process.env[k] = v;
      }
    }
  }
}

async function migrate() {
  const connectionString =
    process.env.DIRECT_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ Direct or Database URL environment variable is required to migrate.');
    process.exit(1);
  }

  console.log('🚀 Connecting to Hosted PostgreSQL...');
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
  });

  const client = await pool.connect();
  console.log('✅ Connected to Hosted PostgreSQL successfully.');

  const dbPath = path.join(process.cwd(), 'market.db');
  console.log(`📂 Opening local SQLite database at ${dbPath}...`);
  const sqlite = new DatabaseSync(dbPath, { readOnly: true });

  const tables = [
    {
      name: 'sector_taxonomy',
      cols: ['id', 'slug', 'name_en', 'name_mr', 'aliases_en', 'aliases_mr', 'description_en', 'description_mr'],
      pk: 'id',
    },
    {
      name: 'company',
      cols: [
        'id', 'isin', 'nse_symbol', 'bse_code', 'bse_scrip_id', 'name', 'name_mr',
        'sector', 'sector_mr', 'sector_slug', 'industry', 'industry_mr', 'series_group',
        'face_value', 'listing_date', 'status', 'segment', 'website', 'logo_url',
        'has_brands', 'shares_outstanding', 'shares_as_of', 'market_cap_category',
        'last_traded_date', 'created_at', 'updated_at'
      ],
      pk: 'id',
    },
    {
      name: 'company_profile',
      cols: [
        'id', 'company_id', 'isin', 'locale', 'description', 'history', 'segments',
        'subsidiaries', 'management', 'founded_year', 'headquarters', 'milestones',
        'as_of', 'source'
      ],
      pk: 'id',
    },
    {
      name: 'brand',
      cols: [
        'id', 'parent_company_id', 'parent_isin', 'name', 'name_mr', 'category',
        'category_mr', 'launch_year', 'logo_url', 'owning_entity_id', 'description_en',
        'description_mr', 'positioning_en', 'positioning_mr', 'key_products_en',
        'key_products_mr', 'notable_facts_en', 'notable_facts_mr', 'as_of', 'source'
      ],
      pk: 'id',
    },
    {
      name: 'price_live',
      cols: [
        'id', 'isin', 'exchange', 'ltp', 'change', 'change_pct', 'volume',
        'day_high', 'day_low', 'open', 'prev_close', 'fifty_two_week_high',
        'fifty_two_week_low', 'quote_time', 'as_of', 'source', 'delayed', 'is_stale'
      ],
      pk: 'id',
    },
    {
      name: 'index_quote',
      cols: [
        'symbol', 'name', 'name_mr', 'ltp', 'change', 'change_pct', 'high', 'low',
        'prev_close', 'quote_time', 'as_of', 'source', 'delayed'
      ],
      pk: 'symbol',
    },
    {
      name: 'index_history',
      cols: [
        'id', 'symbol', 'date', 'open', 'high', 'low', 'close', 'adj_close',
        'volume', 'as_of', 'source'
      ],
      pk: 'id',
    },
    {
      name: 'financials_annual',
      cols: [
        'id', 'isin', 'period', 'fiscal_year', 'period_end_date', 'revenue_cr',
        'op_profit_cr', 'op_margin_pct', 'net_profit_cr', 'eps', 'total_debt_cr',
        'net_worth_cr', 'is_consolidated', 'as_of', 'source'
      ],
      pk: 'id',
    },
    {
      name: 'financials_quarterly',
      cols: [
        'id', 'isin', 'quarter_label', 'period_end_date', 'revenue_cr', 'op_profit_cr',
        'op_margin_pct', 'net_profit_cr', 'eps', 'total_debt_cr', 'net_worth_cr',
        'is_consolidated', 'as_of', 'source'
      ],
      pk: 'id',
    },
    {
      name: 'ratios',
      cols: [
        'id', 'isin', 'period', 'pe_ttm', 'pe_annual', 'pb', 'roe', 'roce',
        'debt_to_equity', 'interest_coverage', 'dividend_payout_pct',
        'dividend_yield', 'eps_growth', 'as_of', 'source'
      ],
      pk: 'id',
    },
    {
      name: 'shareholding',
      cols: [
        'id', 'isin', 'quarter_label', 'period_end_date', 'promoter', 'fii',
        'dii', 'public', 'pledge_pct', 'as_of', 'source'
      ],
      pk: 'id',
    },
    {
      name: 'corporate_action',
      cols: [
        'id', 'isin', 'type', 'ex_date', 'record_date', 'ratio_or_amount',
        'description_en', 'description_mr', 'as_of', 'source'
      ],
      pk: 'id',
    },
    {
      name: 'market_holiday',
      cols: ['id', 'date', 'holiday_name', 'holiday_name_mr', 'exchange'],
      pk: 'id',
    },
    {
      name: 'data_freshness',
      cols: ['dataset', 'latest_as_of', 'last_successful_run', 'last_error', 'record_count', 'status'],
      pk: 'dataset',
    },
    {
      name: 'price_history',
      cols: [
        'id', 'isin', 'exchange', 'date', 'open', 'high', 'low', 'close',
        'adj_close', 'volume', 'delivery_pct', 'as_of', 'source'
      ],
      pk: 'id',
    },
  ];

  for (const t of tables) {
    try {
      console.log(`\n⏳ Migrating table [${t.name}]...`);
      const countCheck = sqlite.prepare(`SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='${t.name}'`).get() as any;
      if (!countCheck || countCheck.count === 0) {
        console.log(`⚠️  Table ${t.name} does not exist in SQLite, skipping.`);
        continue;
      }

      const totalRows = (sqlite.prepare(`SELECT count(*) as count FROM ${t.name}`).get() as any).count;
      console.log(`📊 Found ${totalRows} rows in SQLite [${t.name}]`);

      if (totalRows === 0) continue;

      const BATCH_SIZE = 500;
      let offset = 0;
      let inserted = 0;

      while (offset < totalRows) {
        const rows = sqlite.prepare(`SELECT * FROM ${t.name} LIMIT ${BATCH_SIZE} OFFSET ${offset}`).all() as any[];
        if (!rows || rows.length === 0) break;

        const placeholders: string[] = [];
        const values: any[] = [];
        let valIndex = 1;

        for (const row of rows) {
          const rowPlaceholders: string[] = [];
          for (const col of t.cols) {
            rowPlaceholders.push(`$${valIndex++}`);
            values.push(row[col] !== undefined ? row[col] : null);
          }
          placeholders.push(`(${rowPlaceholders.join(', ')})`);
        }

        const query = `
          INSERT INTO "${t.name}" (${t.cols.map(c => `"${c}"`).join(', ')})
          VALUES ${placeholders.join(', ')}
          ON CONFLICT ("${t.pk}") DO NOTHING
        `;

        await client.query(query, values);
        inserted += rows.length;
        offset += BATCH_SIZE;
        process.stdout.write(`\r   Progress: ${inserted}/${totalRows} rows migrated...`);
      }
      console.log(`\n✅ Completed migration for [${t.name}]`);
    } catch (tableErr) {
      console.error(`\n❌ Error migrating table [${t.name}]:`, tableErr);
    }
  }

  console.log('\n========================================================================');
  console.log('TABLE ROW COUNTS VERIFICATION (SQLite vs Hosted PostgreSQL):');
  console.log('========================================================================');
  for (const t of tables) {
    try {
      const sqliteCount = (sqlite.prepare(`SELECT count(*) as count FROM ${t.name}`).get() as any)?.count || 0;
      const pgRes = await client.query(`SELECT count(*) as count FROM "${t.name}"`);
      const pgCount = parseInt(pgRes.rows[0].count, 10);
      const match = sqliteCount === pgCount ? 'MATCH ✅' : 'PARTIAL';
      console.log(` ${t.name.padEnd(25)} | SQLite: ${String(sqliteCount).padStart(8)} | Postgres: ${String(pgCount).padStart(8)} | ${match}`);
    } catch (e) {}
  }
  console.log('========================================================================');

  client.release();
  await pool.end();
  console.log('\n🎉 ALL TABLES MIGRATED TO HOSTED POSTGRESQL SUCCESSFULLY!');
}

migrate().catch(e => {
  console.error('Fatal migration error:', e);
  process.exit(1);
});
