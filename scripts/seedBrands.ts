import { getDb } from '../lib/db.ts';
import { BRANDS } from '../data/brands.ts';

export async function seedBrands() {
  const db = getDb();
  console.log(`Seeding ${BRANDS.length} verified brands into SQLite brand table...`);

  const stmt = db.prepare(`
    INSERT INTO brand (
      id, parent_company_id, parent_isin, name, name_mr,
      category, category_mr, launch_year, logo_url, owning_entity_id,
      description_en, description_mr, positioning_en, positioning_mr,
      key_products_en, key_products_mr, notable_facts_en, notable_facts_mr,
      as_of, source
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?
    )
    ON CONFLICT(id) DO UPDATE SET
      parent_company_id = excluded.parent_company_id,
      parent_isin = excluded.parent_isin,
      name = excluded.name,
      name_mr = excluded.name_mr,
      category = excluded.category,
      category_mr = excluded.category_mr,
      launch_year = excluded.launch_year,
      description_en = excluded.description_en,
      description_mr = excluded.description_mr,
      positioning_en = excluded.positioning_en,
      positioning_mr = excluded.positioning_mr,
      key_products_en = excluded.key_products_en,
      key_products_mr = excluded.key_products_mr,
      notable_facts_en = excluded.notable_facts_en,
      notable_facts_mr = excluded.notable_facts_mr,
      as_of = excluded.as_of,
      source = excluded.source
  `);

  const updateCompanyStmt = db.prepare(`
    UPDATE company SET has_brands = 1 WHERE isin = ? OR id = ?
  `);

  for (const b of BRANDS) {
    stmt.run(
      b.id,
      b.parentCompanyId,
      b.parentIsin,
      b.name,
      b.nameMr,
      b.category,
      b.categoryMr,
      b.launchYear,
      b.logoUrl || null,
      b.owningEntityId || null,
      b.descriptionEn,
      b.descriptionMr,
      b.positioningEn,
      b.positioningMr,
      JSON.stringify(b.keyProductsEn),
      JSON.stringify(b.keyProductsMr),
      JSON.stringify(b.notableFactsEn),
      JSON.stringify(b.notableFactsMr),
      '2026-11-07',
      'Curated from Company Annual Reports & Corporate Disclosures'
    );

    updateCompanyStmt.run(b.parentIsin, b.parentCompanyId);
  }

  // Record freshness
  db.prepare(`
    INSERT INTO data_freshness (dataset, latest_as_of, last_successful_run, record_count, status)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(dataset) DO UPDATE SET
      latest_as_of = excluded.latest_as_of,
      last_successful_run = excluded.last_successful_run,
      record_count = excluded.record_count,
      status = excluded.status
  `).run('brand', '2026-11-07', new Date().toISOString(), BRANDS.length, 'OK');

  console.log(`Successfully seeded ${BRANDS.length} brands into database.`);
}

if (process.argv[1]?.includes('seedBrands')) {
  seedBrands().catch(console.error);
}
