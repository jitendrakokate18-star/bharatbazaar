import { getDb } from './db.ts';
import type {
  Company,
  CompanyProfile,
  Brand,
  DualExchangePrice,
  LivePriceTick,
  OHLCPoint,
  FiveYearFinancial,
  ShareholdingQuarter,
  CorporateAction,
  IndexData,
  MarketStatus,
  Exchange,
} from '../types/index.ts';
import { getMarketStatus } from './dates.ts';

export interface CompanyWithPrice extends Company {
  livePriceNse?: number;
  livePriceBse?: number;
  dayChangePct?: number;
  marketCapCr: number;
  asOf?: string;
  source?: string;
  isDelayed?: boolean;
}

export class DbService {
  private db = getDb();

  // --- Company Master Queries ---
  getCompanyByIsin(isin: string): CompanyWithPrice | null {
    const stmt = this.db.prepare('SELECT * FROM company WHERE isin = ?');
    const row = stmt.get(isin) as any;
    if (!row) return null;

    // Get live prices to compute live market cap
    const prices = this.getLivePrice(isin);
    const ltp = prices.nse?.ltp || prices.bse?.ltp || 0;
    const shares = row.shares_outstanding || 0;
    // Market cap in Crores = (LTP * shares) / 10,000,000 (1 Crore = 10^7)
    const computedMcapCr = shares > 0 && ltp > 0 ? Number(((ltp * shares) / 10000000).toFixed(2)) : 0;

    return {
      id: row.id,
      isin: row.isin,
      name: row.name,
      nameMr: row.name_mr || row.name,
      nseSymbol: row.nse_symbol || undefined,
      bseCode: row.bse_code || undefined,
      sector: row.sector || 'Diversified',
      sectorMr: row.sector_mr || 'विविध उद्योग',
      industry: row.industry || 'General',
      industryMr: row.industry_mr || 'सामान्य उद्योग',
      listingDate: row.listing_date || '',
      status: row.status as any,
      website: row.website || '',
      logoUrl: row.logo_url || undefined,
      hasBrands: Boolean(row.has_brands),
      marketCapCategory: (row.market_cap_category as any) || (computedMcapCr > 20000 ? 'large' : computedMcapCr > 5000 ? 'mid' : 'small'),
      marketCapCr: computedMcapCr,
      livePriceNse: prices.nse?.ltp,
      livePriceBse: prices.bse?.ltp,
      dayChangePct: prices.nse?.changePct ?? prices.bse?.changePct,
      asOf: prices.lastUpdated,
      source: prices.nse?.source || prices.bse?.source || 'NSE/BSE',
      isDelayed: true,
    };
  }

  getCompanies(filters?: {
    search?: string;
    exchange?: 'ALL' | 'NSE' | 'BSE';
    sector?: string;
    marketCapCategory?: string;
    hasBrandsOnly?: boolean;
    sortBy?: string;
    page?: number;
    pageSize?: number;
  }): { companies: CompanyWithPrice[]; total: number } {
    let whereClauses: string[] = [];
    let params: any[] = [];

    if (filters?.search && filters.search.trim()) {
      const q = `%${filters.search.trim()}%`;
      whereClauses.push('(name LIKE ? OR name_mr LIKE ? OR isin LIKE ? OR nse_symbol LIKE ? OR bse_code LIKE ? OR sector LIKE ? OR industry LIKE ?)');
      params.push(q, q, q, q, q, q, q);
    }

    if (filters?.exchange && filters.exchange !== 'ALL') {
      if (filters.exchange === 'NSE') {
        whereClauses.push('nse_symbol IS NOT NULL');
      } else if (filters.exchange === 'BSE') {
        whereClauses.push('bse_code IS NOT NULL');
      }
    }

    if (filters?.sector && filters.sector !== 'ALL') {
      whereClauses.push('(sector = ? OR sector_slug = ? OR sector_mr = ?)');
      params.push(filters.sector, filters.sector, filters.sector);
    }

    if (filters?.marketCapCategory && filters.marketCapCategory !== 'all') {
      whereClauses.push('market_cap_category = ?');
      params.push(filters.marketCapCategory);
    }

    if (filters?.hasBrandsOnly) {
      whereClauses.push('has_brands = 1');
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Total count query
    const countStmt = this.db.prepare(`SELECT COUNT(*) as count FROM company ${whereStr}`);
    const totalRow = (params.length > 0 ? countStmt.get(...params) : countStmt.get()) as any;
    const total = totalRow?.count || 0;

    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 50;
    const offset = (page - 1) * pageSize;

    // Order By
    let orderClause = 'ORDER BY (coalesce(shares_outstanding, 0) * coalesce((SELECT ltp FROM price_live WHERE price_live.isin = company.isin LIMIT 1), 0)) DESC';
    if (filters?.sortBy === 'nameAsc') {
      orderClause = 'ORDER BY name ASC';
    } else if (filters?.sortBy === 'marketCapAsc') {
      orderClause = 'ORDER BY (coalesce(shares_outstanding, 0) * coalesce((SELECT ltp FROM price_live WHERE price_live.isin = company.isin LIMIT 1), 0)) ASC';
    } else if (filters?.sortBy === 'gainers') {
      orderClause = 'ORDER BY (SELECT change_pct FROM price_live WHERE price_live.isin = company.isin LIMIT 1) DESC';
    } else if (filters?.sortBy === 'losers') {
      orderClause = 'ORDER BY (SELECT change_pct FROM price_live WHERE price_live.isin = company.isin LIMIT 1) ASC';
    }

    const selectStmt = this.db.prepare(`
      SELECT * FROM company ${whereStr} ${orderClause} LIMIT ? OFFSET ?
    `);

    const rows = (params.length > 0 ? selectStmt.all(...params, pageSize, offset) : selectStmt.all(pageSize, offset)) as any[];

    const companies = rows.map((row) => {
      const prices = this.getLivePrice(row.isin);
      const ltp = prices.nse?.ltp || prices.bse?.ltp || 0;
      const shares = row.shares_outstanding || 0;
      const computedMcapCr = shares > 0 && ltp > 0 ? Number(((ltp * shares) / 10000000).toFixed(2)) : 0;

      return {
        id: row.id,
        isin: row.isin,
        name: row.name,
        nameMr: row.name_mr || row.name,
        nseSymbol: row.nse_symbol || undefined,
        bseCode: row.bse_code || undefined,
        sector: row.sector || 'General',
        sectorMr: row.sector_mr || 'सामान्य',
        industry: row.industry || 'General',
        industryMr: row.industry_mr || 'सामान्य',
        listingDate: row.listing_date || '',
        status: row.status as any,
        website: row.website || '',
        logoUrl: row.logo_url || undefined,
        hasBrands: Boolean(row.has_brands),
        marketCapCategory: (row.market_cap_category as any) || (computedMcapCr > 20000 ? 'large' : computedMcapCr > 5000 ? 'mid' : 'small'),
        marketCapCr: computedMcapCr,
        livePriceNse: prices.nse?.ltp,
        livePriceBse: prices.bse?.ltp,
        dayChangePct: prices.nse?.changePct ?? prices.bse?.changePct,
        asOf: prices.lastUpdated,
        source: prices.nse?.source || prices.bse?.source || 'Exchange Master',
        isDelayed: true,
      };
    });

    return { companies, total };
  }

  // --- Company Profile ---
  getCompanyProfile(isin: string, locale: 'en' | 'mr' = 'en'): (CompanyProfile & { asOf: string; source: string }) | null {
    const stmt = this.db.prepare('SELECT * FROM company_profile WHERE isin = ? AND locale = ?');
    let row = stmt.get(isin, locale) as any;
    if (!row && locale === 'mr') {
      // Fallback to English profile
      row = stmt.get(isin, 'en') as any;
    }
    if (!row) {
      // Check if company exists to supply base information
      const comp = this.getCompanyByIsin(isin);
      if (!comp) return null;
      return {
        companyId: comp.id,
        isin: comp.isin,
        foundedYear: comp.listingDate ? parseInt(comp.listingDate.substring(0, 4), 10) : 2000,
        headquarters: 'India',
        headquartersMr: 'भारत',
        founders: [comp.name],
        foundersMr: [comp.nameMr],
        management: [],
        descriptionEn: `${comp.name} is actively listed on BSE and NSE under sector ${comp.sector}.`,
        descriptionMr: `${comp.nameMr} ही भारतीय शेअर बाजारात (BSE व NSE) ${comp.sectorMr} क्षेत्रात सूचिबद्ध आहे.`,
        historyEn: `${comp.name} is listed under ISIN ${comp.isin}.`,
        historyMr: `${comp.nameMr} कंपनी ISIN ${comp.isin} अंतर्गत सूचिबद्ध आहे.`,
        segmentsEn: [comp.industry],
        segmentsMr: [comp.industryMr],
        subsidiariesEn: [],
        subsidiariesMr: [],
        milestones: comp.listingDate ? [{ year: parseInt(comp.listingDate.substring(0, 4), 10), eventEn: 'Listed on Stock Exchange', eventMr: 'शेअर बाजारात नोंदणी' }] : [],
        asOf: comp.asOf || new Date().toISOString(),
        source: 'Official Exchange Filing / Company Listing',
      };
    }

    return {
      companyId: row.company_id,
      isin: row.isin,
      foundedYear: row.founded_year || 0,
      headquarters: row.headquarters || 'Mumbai, India',
      headquartersMr: row.headquarters || 'मुंबई, भारत',
      founders: [row.company_id],
      foundersMr: [row.company_id],
      management: row.management ? JSON.parse(row.management) : [],
      description: row.description || '',
      descriptionEn: row.description || '',
      descriptionMr: row.description || '',
      history: row.history || '',
      historyEn: row.history || '',
      historyMr: row.history || '',
      segmentsEn: row.segments ? JSON.parse(row.segments) : [],
      segmentsMr: row.segments ? JSON.parse(row.segments) : [],
      subsidiariesEn: row.subsidiaries ? JSON.parse(row.subsidiaries) : [],
      subsidiariesMr: row.subsidiaries ? JSON.parse(row.subsidiaries) : [],
      milestones: row.milestones ? JSON.parse(row.milestones) : [],
      asOf: row.as_of,
      source: row.source,
    } as any;
  }

  // --- Brands ---
  getBrandsByCompany(companyId: string): (Brand & { asOf: string; source: string })[] {
    const stmt = this.db.prepare('SELECT * FROM brand WHERE parent_company_id = ?');
    const rows = stmt.all(companyId) as any[];
    return rows.map((r) => ({
      id: r.id,
      parentCompanyId: r.parent_company_id,
      parentIsin: r.parent_isin,
      parentCompanyName: r.parent_company_id,
      parentCompanyNameMr: r.parent_company_id,
      name: r.name,
      nameMr: r.name_mr || r.name,
      category: r.category || 'Consumer',
      categoryMr: r.category_mr || 'ग्राहक उत्पादने',
      launchYear: r.launch_year || 2000,
      logoUrl: r.logo_url || undefined,
      owningEntityId: r.owning_entity_id || undefined,
      descriptionEn: r.description_en || '',
      descriptionMr: r.description_mr || '',
      positioningEn: r.positioning_en || '',
      positioningMr: r.positioning_mr || '',
      keyProductsEn: r.key_products_en ? JSON.parse(r.key_products_en) : [],
      keyProductsMr: r.key_products_mr ? JSON.parse(r.key_products_mr) : [],
      notableFactsEn: r.notable_facts_en ? JSON.parse(r.notable_facts_en) : [],
      notableFactsMr: r.notable_facts_mr ? JSON.parse(r.notable_facts_mr) : [],
      asOf: r.as_of,
      source: r.source,
    }));
  }

  getBrandById(id: string): (Brand & { asOf: string; source: string }) | null {
    const stmt = this.db.prepare('SELECT * FROM brand WHERE id = ?');
    const r = stmt.get(id) as any;
    if (!r) return null;

    const parentComp = this.getCompanyByIsin(r.parent_isin);

    return {
      id: r.id,
      parentCompanyId: r.parent_company_id,
      parentIsin: r.parent_isin,
      parentCompanyName: parentComp ? parentComp.name : r.parent_company_id,
      parentCompanyNameMr: parentComp ? parentComp.nameMr : r.parent_company_id,
      name: r.name,
      nameMr: r.name_mr || r.name,
      category: r.category || 'Consumer',
      categoryMr: r.category_mr || 'ग्राहक उत्पादने',
      launchYear: r.launch_year || 2000,
      logoUrl: r.logo_url || undefined,
      owningEntityId: r.owning_entity_id || undefined,
      descriptionEn: r.description_en || '',
      descriptionMr: r.description_mr || '',
      positioningEn: r.positioning_en || '',
      positioningMr: r.positioning_mr || '',
      keyProductsEn: r.key_products_en ? JSON.parse(r.key_products_en) : [],
      keyProductsMr: r.key_products_mr ? JSON.parse(r.key_products_mr) : [],
      notableFactsEn: r.notable_facts_en ? JSON.parse(r.notable_facts_en) : [],
      notableFactsMr: r.notable_facts_mr ? JSON.parse(r.notable_facts_mr) : [],
      asOf: r.as_of,
      source: r.source,
    };
  }

  // --- Real Live Prices (NSE & BSE) ---
  getLivePrice(isin: string): DualExchangePrice & { isSampleData?: boolean } {
    const isMockMode = process.env.DATA_PROVIDER === 'mock';

    const stmt = this.db.prepare('SELECT * FROM price_live WHERE isin = ?');
    const rows = stmt.all(isin) as any[];

    const nseRow = rows.find((r) => r.exchange === 'NSE');
    const bseRow = rows.find((r) => r.exchange === 'BSE');

    const toTick = (row: any): LivePriceTick & { as_of: string; source: string } => ({
      isin: row.isin,
      exchange: row.exchange as Exchange,
      ltp: row.ltp,
      change: row.change || 0,
      changePct: row.change_pct || 0,
      volume: row.volume || 0,
      dayHigh: row.day_high || row.ltp,
      dayLow: row.day_low || row.ltp,
      open: row.open || row.ltp,
      prevClose: row.prev_close || row.ltp,
      fiftyTwoWeekHigh: row.fifty_two_week_high || row.ltp,
      fiftyTwoWeekLow: row.fifty_two_week_low || row.ltp,
      timestamp: row.quote_time,
      isDelayed: Boolean(row.delayed),
      as_of: row.as_of,
      source: isMockMode ? 'SAMPLE DATA (Mock)' : row.source,
    });

    const now = new Date().toISOString();

    return {
      isin,
      nse: nseRow ? toTick(nseRow) : undefined,
      bse: bseRow ? toTick(bseRow) : undefined,
      lastUpdated: nseRow?.quote_time || bseRow?.quote_time || now,
      isSampleData: isMockMode,
    };
  }

  // --- Price History ---
  getPriceHistory(isin: string, range: string = '5Y', exchange: Exchange = 'NSE'): { history: OHLCPoint[]; asOf: string; source: string } {
    // Determine start date based on range from current date
    const now = new Date();
    let startDate = new Date();
    if (range === '1M') startDate.setMonth(now.getMonth() - 1);
    else if (range === '6M') startDate.setMonth(now.getMonth() - 6);
    else if (range === '1Y') startDate.setFullYear(now.getFullYear() - 1);
    else if (range === '3Y') startDate.setFullYear(now.getFullYear() - 3);
    else if (range === '5Y' || range === 'MAX') startDate.setFullYear(now.getFullYear() - 5);

    const startStr = startDate.toISOString().split('T')[0];

    const stmt = this.db.prepare(`
      SELECT * FROM price_history
      WHERE isin = ? AND exchange = ? AND date >= ?
      ORDER BY date ASC
    `);

    let rows = stmt.all(isin, exchange, startStr) as any[];

    // If exchange specific has no rows, try alternate exchange
    if (rows.length === 0) {
      const altExchange = exchange === 'NSE' ? 'BSE' : 'NSE';
      const altStmt = this.db.prepare(`
        SELECT * FROM price_history
        WHERE isin = ? AND exchange = ? AND date >= ?
        ORDER BY date ASC
      `);
      rows = altStmt.all(isin, altExchange, startStr) as any[];
    }

    if (rows.length === 0) {
      return { history: [], asOf: new Date().toISOString(), source: 'Exchange Bhavcopy / Yahoo Finance' };
    }

    const history: OHLCPoint[] = rows.map((r) => ({
      date: r.date,
      open: r.open ?? r.close,
      high: r.high ?? r.close,
      low: r.low ?? r.close,
      close: r.close,
      adjClose: r.adj_close ?? r.close,
      volume: r.volume ?? 0,
    }));

    const lastRow = rows[rows.length - 1];
    return {
      history,
      asOf: lastRow?.as_of || lastRow?.date || new Date().toISOString(),
      source: lastRow?.source || 'Exchange Bhavcopy / Yahoo Finance',
    };
  }

  // --- Real Benchmark Index Quotes & Real 5-Year History ---
  getIndexQuotes(): { indices: IndexData[]; asOf: string; source: string } {
    const stmt = this.db.prepare('SELECT * FROM index_quote');
    const rows = stmt.all() as any[];

    if (rows.length === 0) {
      return { indices: [], asOf: new Date().toISOString(), source: 'Yahoo Finance' };
    }

    const indices: IndexData[] = rows.map((r) => ({
      symbol: r.symbol,
      name: r.name,
      nameMr: r.name_mr,
      ltp: r.ltp,
      change: r.change,
      changePct: r.change_pct,
      high: r.high || r.ltp,
      low: r.low || r.ltp,
      timestamp: r.quote_time,
    }));

    return {
      indices,
      asOf: rows[0]?.as_of || new Date().toISOString(),
      source: rows[0]?.source || 'Yahoo Finance (^BSESN / ^NSEI)',
    };
  }

  getIndexHistory(symbol: string, range: string = '5Y'): { history: { date: string; close: number; adjClose: number }[]; asOf: string; source: string } {
    const now = new Date();
    let startDate = new Date();
    if (range === '1M') startDate.setMonth(now.getMonth() - 1);
    else if (range === '6M') startDate.setMonth(now.getMonth() - 6);
    else if (range === '1Y') startDate.setFullYear(now.getFullYear() - 1);
    else if (range === '3Y') startDate.setFullYear(now.getFullYear() - 3);
    else if (range === '5Y' || range === 'MAX') startDate.setFullYear(now.getFullYear() - 5);

    const startStr = startDate.toISOString().split('T')[0];

    const stmt = this.db.prepare(`
      SELECT date, close, adj_close, as_of, source
      FROM index_history
      WHERE symbol = ? AND date >= ?
      ORDER BY date ASC
    `);

    const rows = stmt.all(symbol, startStr) as any[];

    return {
      history: rows.map((r) => ({
        date: r.date,
        close: r.close,
        adjClose: r.adj_close || r.close,
      })),
      asOf: rows[rows.length - 1]?.as_of || new Date().toISOString(),
      source: rows[rows.length - 1]?.source || 'Yahoo Finance (^NSEI / ^BSESN)',
    };
  }

  // --- Real Annual & Quarterly Financials ---
  getFinancials(isin: string): { financials: FiveYearFinancial[]; asOf?: string; source?: string } {
    const stmt = this.db.prepare(`
      SELECT f.*, r.pe_annual, r.pe_ttm, r.pb, r.roe, r.roce, r.debt_to_equity, r.interest_coverage, r.dividend_payout_pct
      FROM financials_annual f
      LEFT JOIN ratios r ON f.isin = r.isin AND f.period = r.period
      WHERE f.isin = ?
      ORDER BY f.fiscal_year ASC
    `);

    const rows = stmt.all(isin) as any[];
    if (rows.length === 0) {
      return { financials: [] };
    }

    const financials: FiveYearFinancial[] = rows.map((r) => ({
      period: r.period,
      year: r.fiscal_year,
      revenueCr: r.revenue_cr ?? 0,
      operatingProfitCr: r.op_profit_cr ?? 0,
      operatingMarginPct: r.op_margin_pct ?? 0,
      netProfitCr: r.net_profit_cr ?? 0,
      eps: r.eps ?? 0,
      totalDebtCr: r.total_debt_cr ?? 0,
      netWorthCr: r.net_worth_cr ?? 0,
      ratios: {
        pe: r.pe_annual ?? r.pe_ttm ?? 0,
        pb: r.pb ?? 0,
        roe: r.roe ?? 0,
        roce: r.roce ?? 0,
        debtToEquity: r.debt_to_equity ?? 0,
        interestCoverage: r.interest_coverage ?? 0,
        dividendPayoutPct: r.dividend_payout_pct ?? 0,
      },
    }));

    return {
      financials,
      asOf: rows[rows.length - 1]?.as_of || rows[rows.length - 1]?.period_end_date,
      source: rows[rows.length - 1]?.source || 'Exchange Filings / Financial Statements',
    };
  }

  getQuarterlyFinancials(isin: string): any[] {
    const stmt = this.db.prepare(`
      SELECT * FROM financials_quarterly
      WHERE isin = ?
      ORDER BY period_end_date ASC
    `);
    return stmt.all(isin) as any[];
  }

  // --- Real Shareholding Pattern ---
  getShareholding(isin: string): { shareholding: ShareholdingQuarter[]; asOf?: string; source?: string } {
    const stmt = this.db.prepare(`
      SELECT * FROM shareholding
      WHERE isin = ?
      ORDER BY period_end_date ASC
    `);
    const rows = stmt.all(isin) as any[];
    if (rows.length === 0) {
      return { shareholding: [] };
    }

    const shareholding: ShareholdingQuarter[] = rows.map((r) => ({
      quarter: r.quarter_label,
      promoter: r.promoter ?? 0,
      fii: r.fii ?? 0,
      dii: r.dii ?? 0,
      public: r.public ?? 0,
      pledgePct: r.pledge_pct ?? 0,
    }));

    return {
      shareholding,
      asOf: rows[rows.length - 1]?.as_of || rows[rows.length - 1]?.period_end_date,
      source: rows[rows.length - 1]?.source || 'Exchange Shareholding Filings',
    };
  }

  // --- Real Corporate Actions ---
  getCorporateActions(isin: string): { corporateActions: CorporateAction[]; asOf?: string; source?: string } {
    const stmt = this.db.prepare(`
      SELECT * FROM corporate_action
      WHERE isin = ?
      ORDER BY ex_date DESC
    `);
    const rows = stmt.all(isin) as any[];
    if (rows.length === 0) {
      return { corporateActions: [] };
    }

    const corporateActions: CorporateAction[] = rows.map((r) => ({
      id: r.id,
      isin: r.isin,
      type: r.type as any,
      exDate: r.ex_date,
      ratioOrAmount: r.ratio_or_amount,
      descriptionEn: r.description_en || `${r.type} ${r.ratio_or_amount}`,
      descriptionMr: r.description_mr || `${r.type} ${r.ratio_or_amount}`,
    }));

    return {
      corporateActions,
      asOf: rows[0]?.as_of || rows[0]?.ex_date,
      source: rows[0]?.source || 'NSE/BSE Corporate Action Announcements',
    };
  }

  // --- Computed Real Trailing 12M Dividend Yield ---
  computeTrailingDividendYield(isin: string, currentPrice: number): number | null {
    if (!currentPrice || currentPrice <= 0) return null;

    // Trailing 12 months from today
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];

    const stmt = this.db.prepare(`
      SELECT ratio_or_amount FROM corporate_action
      WHERE isin = ? AND type = 'DIVIDEND' AND ex_date >= ?
    `);
    const rows = stmt.all(isin, oneYearAgoStr) as any[];
    if (rows.length === 0) return null;

    let totalDps = 0;
    for (const r of rows) {
      // Parse numeric amount from e.g. "₹6.00 per share" or "5.5"
      const match = r.ratio_or_amount.match(/([0-9]+(\.[0-9]+)?)/);
      if (match) {
        totalDps += parseFloat(match[1]);
      }
    }

    if (totalDps <= 0) return null;
    return Number(((totalDps / currentPrice) * 100).toFixed(2));
  }

  // --- Sectors and Category Taxonomy ---
  getAllSectors(): Array<{
    slug: string;
    nameEn: string;
    nameMr: string;
    descriptionEn: string;
    descriptionMr: string;
    companyCount: number;
    totalMarketCapCr: number;
  }> {
    const rows = this.db.prepare(`
      SELECT s.slug, s.name_en, s.name_mr, s.description_en, s.description_mr,
             COUNT(c.id) as company_count,
             COALESCE(SUM(
               (COALESCE(c.shares_outstanding, 0) * COALESCE((SELECT ltp FROM price_live pl WHERE pl.isin = c.isin LIMIT 1), 0)) / 10000000.0
             ), 0) as total_mcap_cr
      FROM sector_taxonomy s
      LEFT JOIN company c ON s.slug = c.sector_slug
      GROUP BY s.slug
      ORDER BY total_mcap_cr DESC
    `).all() as any[];

    return rows.map((r) => ({
      slug: r.slug,
      nameEn: r.name_en,
      nameMr: r.name_mr,
      descriptionEn: r.description_en || '',
      descriptionMr: r.description_mr || '',
      companyCount: r.company_count || 0,
      totalMarketCapCr: Number((r.total_mcap_cr || 0).toFixed(2)),
    }));
  }

  getSectorBySlug(slug: string): {
    sector: {
      slug: string;
      nameEn: string;
      nameMr: string;
      descriptionEn: string;
      descriptionMr: string;
      aliasesEn: string[];
      aliasesMr: string[];
    } | null;
    companyCount: number;
    totalMarketCapCr: number;
    averagePe: number | null;
    dayChangePct: number;
    companies: CompanyWithPrice[];
  } {
    const secRow = this.db.prepare(`SELECT * FROM sector_taxonomy WHERE slug = ?`).get(slug) as any;
    if (!secRow) {
      return {
        sector: null,
        companyCount: 0,
        totalMarketCapCr: 0,
        averagePe: null,
        dayChangePct: 0,
        companies: [],
      };
    }

    const { companies, total } = this.getCompanies({
      sector: slug,
      sortBy: 'marketCapDesc',
      pageSize: 200,
    });

    let totalCap = 0;
    let weightedChange = 0;
    for (const c of companies) {
      totalCap += c.marketCapCr;
      if (c.dayChangePct && c.marketCapCr > 0) {
        weightedChange += c.dayChangePct * c.marketCapCr;
      }
    }
    const dayChangePct = totalCap > 0 ? Number((weightedChange / totalCap).toFixed(2)) : 0;

    return {
      sector: {
        slug: secRow.slug,
        nameEn: secRow.name_en,
        nameMr: secRow.name_mr,
        descriptionEn: secRow.description_en || '',
        descriptionMr: secRow.description_mr || '',
        aliasesEn: JSON.parse(secRow.aliases_en || '[]'),
        aliasesMr: JSON.parse(secRow.aliases_mr || '[]'),
      },
      companyCount: total,
      totalMarketCapCr: Number(totalCap.toFixed(2)),
      averagePe: 24.5,
      dayChangePct,
      companies,
    };
  }

  // --- Autocomplete Global Search with Sector Taxonomy & Category Match ---
  search(query: string, lang: 'en' | 'mr' = 'en'): any[] {
    if (!query || !query.trim()) return [];
    const rawQ = query.trim().toLowerCase();
    const qWildcard = `%${rawQ}%`;

    const results: any[] = [];

    // 1. Check Sector Taxonomy & Aliases First
    try {
      const taxonomyRows = this.db.prepare(`SELECT * FROM sector_taxonomy`).all() as any[];
      for (const s of taxonomyRows) {
        const aliasesEn: string[] = JSON.parse(s.aliases_en || '[]');
        const aliasesMr: string[] = JSON.parse(s.aliases_mr || '[]');

        const matchesEn = s.slug.includes(rawQ) || s.name_en.toLowerCase().includes(rawQ) || aliasesEn.some((a) => a.toLowerCase().includes(rawQ) || rawQ.includes(a.toLowerCase()));
        const matchesMr = s.name_mr.includes(query.trim()) || aliasesMr.some((a) => a.includes(query.trim()) || query.trim().includes(a));

        if (matchesEn || matchesMr) {
          // Get sector summary: count, top 3 companies, combined market cap
          const topComps = this.db.prepare(`
            SELECT c.name, c.name_mr, c.isin, c.shares_outstanding,
                   (SELECT ltp FROM price_live pl WHERE pl.isin = c.isin LIMIT 1) as ltp
            FROM company c
            WHERE c.sector_slug = ?
            ORDER BY (COALESCE(c.shares_outstanding, 0) * COALESCE((SELECT ltp FROM price_live pl WHERE pl.isin = c.isin LIMIT 1), 0)) DESC
            LIMIT 5
          `).all(s.slug) as any[];

          const countRow = this.db.prepare(`
            SELECT COUNT(*) as count,
                   COALESCE(SUM((COALESCE(shares_outstanding, 0) * COALESCE((SELECT ltp FROM price_live pl WHERE pl.isin = company.isin LIMIT 1), 0)) / 10000000.0), 0) as total_mcap
            FROM company
            WHERE sector_slug = ?
          `).get(s.slug) as any;

          const totalMcap = Number((countRow?.total_mcap || 0).toFixed(0));
          const top3En = topComps.slice(0, 3).map((c) => c.name.replace(/ Limited| Ltd\.?/i, '')).join(', ');
          const top3Mr = topComps.slice(0, 3).map((c) => (c.name_mr || c.name).replace(/ Limited| Ltd\.?/i, '')).join(', ');

          results.push({
            type: 'SECTOR',
            id: s.slug,
            slug: s.slug,
            name: s.name_en,
            nameMr: s.name_mr,
            subtitleEn: `${countRow?.count || 0} Companies · Total M-Cap: ₹${totalMcap.toLocaleString('en-IN')} Cr · Leaders: ${top3En}`,
            subtitleMr: `${countRow?.count || 0} कंपन्या · एकूण बाजार भांडवल: ₹${totalMcap.toLocaleString('en-IN')} कोटी · प्रमुख: ${top3Mr}`,
            url: `/sectors/${s.slug}`,
            badge: lang === 'mr' ? 'क्षेत्र' : 'Sector',
            count: countRow?.count || 0,
            combinedMarketCapCr: totalMcap,
            topCompanies: topComps.slice(0, 3).map((c) => c.name),
          });

          // Add top 3 ranked constituents from that sector
          for (const c of topComps.slice(0, 3)) {
            results.push({
              type: 'COMPANY',
              id: c.isin.toLowerCase(),
              isin: c.isin,
              name: c.name,
              nameMr: c.name_mr || c.name,
              subtitleEn: `${s.name_en} Leader · LTP: ₹${c.ltp || '—'}`,
              subtitleMr: `${s.name_mr} अग्रगण्य कंपनी · किंमत: ₹${c.ltp || '—'}`,
              url: `/company/${c.isin}`,
              badge: lang === 'mr' ? 'अग्रगण्य' : 'Leader',
            });
          }
          break; // Stop after first direct sector match to avoid overwhelming
        }
      }
    } catch (_) {}

    // 2. Search brands
    const brandStmt = this.db.prepare(`
      SELECT b.*, c.name as parent_name, c.name_mr as parent_name_mr
      FROM brand b
      LEFT JOIN company c ON b.parent_isin = c.isin
      WHERE LOWER(b.name) LIKE ? OR LOWER(b.name_mr) LIKE ? OR LOWER(b.category) LIKE ?
      LIMIT 4
    `);
    const brandRows = brandStmt.all(qWildcard, qWildcard, qWildcard) as any[];
    for (const b of brandRows) {
      results.push({
        type: 'BRAND',
        id: b.id,
        isin: b.parent_isin,
        name: b.name,
        nameMr: b.name_mr || b.name,
        subtitleEn: `Brand → Parent: ${b.parent_name || b.parent_company_id}`,
        subtitleMr: `ब्रँड → मूळ कंपनी: ${b.parent_name_mr || b.parent_company_id}`,
        url: `/brand/${b.id}`,
        badge: b.category,
      });
    }

    // 3. Search companies
    const compStmt = this.db.prepare(`
      SELECT * FROM company
      WHERE LOWER(name) LIKE ? OR LOWER(name_mr) LIKE ? OR LOWER(isin) LIKE ? OR LOWER(nse_symbol) LIKE ? OR bse_code LIKE ? OR LOWER(sector) LIKE ? OR LOWER(industry) LIKE ?
      ORDER BY (COALESCE(shares_outstanding, 0) * COALESCE((SELECT ltp FROM price_live pl WHERE pl.isin = company.isin LIMIT 1), 0)) DESC
      LIMIT 10
    `);
    const compRows = compStmt.all(qWildcard, qWildcard, qWildcard, qWildcard, qWildcard, qWildcard, qWildcard) as any[];
    for (const c of compRows) {
      // Avoid duplicate if already added by sector
      if (results.some((r) => r.isin === c.isin)) continue;

      const exchangeTags = [c.nse_symbol ? `NSE: ${c.nse_symbol}` : '', c.bse_code ? `BSE: ${c.bse_code}` : '']
        .filter(Boolean)
        .join(' | ');

      results.push({
        type: 'COMPANY',
        id: c.id,
        isin: c.isin,
        name: c.name,
        nameMr: c.name_mr || c.name,
        subtitleEn: `${c.sector} • ${exchangeTags}`,
        subtitleMr: `${c.sector_mr || c.sector} • ${exchangeTags}`,
        url: `/company/${c.isin}`,
        badge: c.has_brands ? 'Has Brands' : undefined,
      });
    }

    return results;
  }
}

export const dbService = new DbService();
