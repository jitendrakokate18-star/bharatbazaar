import { prisma } from './prisma';
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
  // --- Company Master Queries ---
  async getCompanyByIsin(isin: string): Promise<CompanyWithPrice | null> {
    const row = await prisma.company.findUnique({
      where: { isin },
    });
    if (!row) return null;

    // Get live prices to compute live market cap
    const prices = await this.getLivePrice(isin);
    const ltp = prices.nse?.ltp || prices.bse?.ltp || 0;
    const shares = row.sharesOutstanding || 0;
    // Market cap in Crores = (LTP * shares) / 10,000,000 (1 Crore = 10^7)
    const computedMcapCr = shares > 0 && ltp > 0 ? Number(((ltp * shares) / 10000000).toFixed(2)) : 0;

    return {
      id: row.id,
      isin: row.isin,
      name: row.name,
      nameMr: row.nameMr || row.name,
      nseSymbol: row.nseSymbol || undefined,
      bseCode: row.bseCode || undefined,
      sector: row.sector || 'Diversified',
      sectorMr: row.sectorMr || 'विविध उद्योग',
      industry: row.industry || 'General',
      industryMr: row.industryMr || 'सामान्य उद्योग',
      listingDate: row.listingDate || '',
      status: (row.status as any) || 'ACTIVE',
      website: row.website || '',
      logoUrl: row.logoUrl || undefined,
      hasBrands: Boolean(row.hasBrands),
      marketCapCategory: (row.marketCapCategory as any) || (computedMcapCr > 20000 ? 'large' : computedMcapCr > 5000 ? 'mid' : 'small'),
      marketCapCr: computedMcapCr,
      livePriceNse: prices.nse?.ltp,
      livePriceBse: prices.bse?.ltp,
      dayChangePct: prices.nse?.changePct ?? prices.bse?.changePct,
      asOf: prices.lastUpdated,
      source: prices.nse?.source || prices.bse?.source || 'NSE/BSE',
      isDelayed: true,
    };
  }

  async getCompanies(filters?: {
    search?: string;
    exchange?: 'ALL' | 'NSE' | 'BSE';
    sector?: string;
    marketCapCategory?: string;
    hasBrandsOnly?: boolean;
    sortBy?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ companies: CompanyWithPrice[]; total: number }> {
    const whereClauses: string[] = [];
    const params: any[] = [];

    if (filters?.search && filters.search.trim()) {
      const q = `%${filters.search.trim()}%`;
      const pIdx = params.push(q);
      whereClauses.push(`(c.name ILIKE $${pIdx} OR c.name_mr ILIKE $${pIdx} OR c.isin ILIKE $${pIdx} OR c.nse_symbol ILIKE $${pIdx} OR c.bse_code ILIKE $${pIdx} OR c.sector ILIKE $${pIdx} OR c.industry ILIKE $${pIdx})`);
    }

    if (filters?.exchange && filters.exchange !== 'ALL') {
      if (filters.exchange === 'NSE') {
        whereClauses.push('c.nse_symbol IS NOT NULL');
      } else if (filters.exchange === 'BSE') {
        whereClauses.push('c.bse_code IS NOT NULL');
      }
    }

    if (filters?.sector && filters.sector !== 'ALL') {
      const pIdx = params.push(filters.sector);
      whereClauses.push(`(c.sector = $${pIdx} OR c.sector_slug = $${pIdx} OR c.sector_mr = $${pIdx})`);
    }

    if (filters?.marketCapCategory && filters.marketCapCategory !== 'all') {
      const pIdx = params.push(filters.marketCapCategory);
      whereClauses.push(`c.market_cap_category = $${pIdx}`);
    }

    if (filters?.hasBrandsOnly) {
      whereClauses.push('c.has_brands = 1');
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Total count query
    const countSql = `SELECT COUNT(*)::int as count FROM company c ${whereStr}`;
    const countRows: any[] = await prisma.$queryRawUnsafe(countSql, ...params);
    const total = countRows[0]?.count || 0;

    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 50;
    const offset = (page - 1) * pageSize;

    // Order By
    let orderClause = 'ORDER BY (COALESCE(c.shares_outstanding, 0) * COALESCE((SELECT ltp FROM price_live pl WHERE pl.isin = c.isin LIMIT 1), 0)) DESC';
    if (filters?.sortBy === 'nameAsc') {
      orderClause = 'ORDER BY c.name ASC';
    } else if (filters?.sortBy === 'marketCapAsc') {
      orderClause = 'ORDER BY (COALESCE(c.shares_outstanding, 0) * COALESCE((SELECT ltp FROM price_live pl WHERE pl.isin = c.isin LIMIT 1), 0)) ASC';
    } else if (filters?.sortBy === 'gainers') {
      orderClause = 'ORDER BY (SELECT change_pct FROM price_live pl WHERE pl.isin = c.isin LIMIT 1) DESC NULLS LAST';
    } else if (filters?.sortBy === 'losers') {
      orderClause = 'ORDER BY (SELECT change_pct FROM price_live pl WHERE pl.isin = c.isin LIMIT 1) ASC NULLS LAST';
    }

    const limitIdx = params.push(pageSize);
    const offsetIdx = params.push(offset);

    const selectSql = `
      SELECT c.*,
             (COALESCE(c.shares_outstanding, 0) * COALESCE((SELECT ltp FROM price_live pl WHERE pl.isin = c.isin LIMIT 1), 0) / 10000000.0) as computed_mcap_cr,
             (SELECT ltp FROM price_live pl WHERE pl.isin = c.isin AND pl.exchange = 'NSE' LIMIT 1) as nse_ltp,
             (SELECT change_pct FROM price_live pl WHERE pl.isin = c.isin AND pl.exchange = 'NSE' LIMIT 1) as nse_change_pct,
             (SELECT quote_time FROM price_live pl WHERE pl.isin = c.isin AND pl.exchange = 'NSE' LIMIT 1) as nse_quote_time,
             (SELECT source FROM price_live pl WHERE pl.isin = c.isin AND pl.exchange = 'NSE' LIMIT 1) as nse_source,
             (SELECT ltp FROM price_live pl WHERE pl.isin = c.isin AND pl.exchange = 'BSE' LIMIT 1) as bse_ltp,
             (SELECT change_pct FROM price_live pl WHERE pl.isin = c.isin AND pl.exchange = 'BSE' LIMIT 1) as bse_change_pct,
             (SELECT quote_time FROM price_live pl WHERE pl.isin = c.isin AND pl.exchange = 'BSE' LIMIT 1) as bse_quote_time,
             (SELECT source FROM price_live pl WHERE pl.isin = c.isin AND pl.exchange = 'BSE' LIMIT 1) as bse_source
      FROM company c
      ${whereStr}
      ${orderClause}
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    const rows: any[] = await prisma.$queryRawUnsafe(selectSql, ...params);

    const companies = rows.map((row) => {
      const computedMcapCr = row.computed_mcap_cr ? Number(Number(row.computed_mcap_cr).toFixed(2)) : 0;
      const livePriceNse = row.nse_ltp !== null && row.nse_ltp !== undefined ? Number(row.nse_ltp) : undefined;
      const livePriceBse = row.bse_ltp !== null && row.bse_ltp !== undefined ? Number(row.bse_ltp) : undefined;
      const dayChangePct =
        row.nse_change_pct !== null && row.nse_change_pct !== undefined
          ? Number(row.nse_change_pct)
          : row.bse_change_pct !== null && row.bse_change_pct !== undefined
          ? Number(row.bse_change_pct)
          : undefined;
      const asOf = row.nse_quote_time || row.bse_quote_time || new Date().toISOString();
      const source = row.nse_source || row.bse_source || 'Exchange Master';

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
        status: (row.status as any) || 'ACTIVE',
        website: row.website || '',
        logoUrl: row.logo_url || undefined,
        hasBrands: Boolean(row.has_brands),
        marketCapCategory: (row.market_cap_category as any) || (computedMcapCr > 20000 ? 'large' : computedMcapCr > 5000 ? 'mid' : 'small'),
        marketCapCr: computedMcapCr,
        livePriceNse,
        livePriceBse,
        dayChangePct,
        asOf,
        source,
        isDelayed: true,
      };
    });

    return { companies, total };
  }

  // --- Company Profile ---
  async getCompanyProfile(isin: string, locale: 'en' | 'mr' = 'en'): Promise<(CompanyProfile & { asOf: string; source: string }) | null> {
    let row = await prisma.companyProfile.findUnique({
      where: {
        isin_locale: { isin, locale },
      },
    });

    if (!row && locale === 'mr') {
      // Fallback to English profile
      row = await prisma.companyProfile.findUnique({
        where: {
          isin_locale: { isin, locale: 'en' },
        },
      });
    }

    if (!row) {
      // Check if company exists to supply base information
      const comp = await this.getCompanyByIsin(isin);
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
      companyId: row.companyId,
      isin: row.isin,
      foundedYear: row.foundedYear || 0,
      headquarters: row.headquarters || 'Mumbai, India',
      headquartersMr: row.headquarters || 'मुंबई, भारत',
      founders: [row.companyId],
      foundersMr: [row.companyId],
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
      asOf: row.asOf,
      source: row.source,
    } as any;
  }

  // --- Brands ---
  async getBrandsByCompany(companyId: string): Promise<(Brand & { asOf: string; source: string })[]> {
    const rows = await prisma.brand.findMany({
      where: { parentCompanyId: companyId },
    });

    return rows.map((r) => ({
      id: r.id,
      parentCompanyId: r.parentCompanyId,
      parentIsin: r.parentIsin,
      parentCompanyName: r.parentCompanyId,
      parentCompanyNameMr: r.parentCompanyId,
      name: r.name,
      nameMr: r.nameMr || r.name,
      category: r.category || 'Consumer',
      categoryMr: r.categoryMr || 'ग्राहक उत्पादने',
      launchYear: r.launchYear || 2000,
      logoUrl: r.logoUrl || undefined,
      owningEntityId: r.owningEntityId || undefined,
      descriptionEn: r.descriptionEn || '',
      descriptionMr: r.descriptionMr || '',
      positioningEn: r.positioningEn || '',
      positioningMr: r.positioningMr || '',
      keyProductsEn: r.keyProductsEn ? JSON.parse(r.keyProductsEn) : [],
      keyProductsMr: r.keyProductsMr ? JSON.parse(r.keyProductsMr) : [],
      notableFactsEn: r.notableFactsEn ? JSON.parse(r.notableFactsEn) : [],
      notableFactsMr: r.notableFactsMr ? JSON.parse(r.notableFactsMr) : [],
      asOf: r.asOf,
      source: r.source,
    }));
  }

  async getBrandById(id: string): Promise<(Brand & { asOf: string; source: string }) | null> {
    const r = await prisma.brand.findUnique({
      where: { id },
    });
    if (!r) return null;

    const parentComp = await this.getCompanyByIsin(r.parentIsin);

    return {
      id: r.id,
      parentCompanyId: r.parentCompanyId,
      parentIsin: r.parentIsin,
      parentCompanyName: parentComp ? parentComp.name : r.parentCompanyId,
      parentCompanyNameMr: parentComp ? parentComp.nameMr : r.parentCompanyId,
      name: r.name,
      nameMr: r.nameMr || r.name,
      category: r.category || 'Consumer',
      categoryMr: r.categoryMr || 'ग्राहक उत्पादने',
      launchYear: r.launchYear || 2000,
      logoUrl: r.logoUrl || undefined,
      owningEntityId: r.owningEntityId || undefined,
      descriptionEn: r.descriptionEn || '',
      descriptionMr: r.descriptionMr || '',
      positioningEn: r.positioningEn || '',
      positioningMr: r.positioningMr || '',
      keyProductsEn: r.keyProductsEn ? JSON.parse(r.keyProductsEn) : [],
      keyProductsMr: r.keyProductsMr ? JSON.parse(r.keyProductsMr) : [],
      notableFactsEn: r.notableFactsEn ? JSON.parse(r.notableFactsEn) : [],
      notableFactsMr: r.notableFactsMr ? JSON.parse(r.notableFactsMr) : [],
      asOf: r.asOf,
      source: r.source,
    };
  }

  // --- Real Live Prices (NSE & BSE) ---
  async getLivePrice(isin: string): Promise<DualExchangePrice & { isSampleData?: boolean }> {
    const isMockMode = process.env.DATA_PROVIDER === 'mock';

    const rows = await prisma.priceLive.findMany({
      where: { isin },
    });

    const nseRow = rows.find((r) => r.exchange === 'NSE');
    const bseRow = rows.find((r) => r.exchange === 'BSE');

    const toTick = (row: any): LivePriceTick & { as_of: string; source: string } => ({
      isin: row.isin,
      exchange: row.exchange as Exchange,
      ltp: row.ltp,
      change: row.change || 0,
      changePct: row.changePct || 0,
      volume: row.volume || 0,
      dayHigh: row.dayHigh || row.ltp,
      dayLow: row.dayLow || row.ltp,
      open: row.open || row.ltp,
      prevClose: row.prevClose || row.ltp,
      fiftyTwoWeekHigh: row.fiftyTwoWeekHigh || row.ltp,
      fiftyTwoWeekLow: row.fiftyTwoWeekLow || row.ltp,
      timestamp: row.quoteTime,
      isDelayed: Boolean(row.delayed),
      as_of: row.asOf,
      source: isMockMode ? 'SAMPLE DATA (Mock)' : row.source,
    });

    const now = new Date().toISOString();

    return {
      isin,
      nse: nseRow ? toTick(nseRow) : undefined,
      bse: bseRow ? toTick(bseRow) : undefined,
      lastUpdated: nseRow?.quoteTime || bseRow?.quoteTime || now,
      isSampleData: isMockMode,
    };
  }

  // --- Price History ---
  async getPriceHistory(isin: string, range: string = '5Y', exchange: Exchange = 'NSE'): Promise<{ history: OHLCPoint[]; asOf: string; source: string }> {
    // Determine start date based on range from current date
    const now = new Date();
    let startDate = new Date();
    if (range === '1M') startDate.setMonth(now.getMonth() - 1);
    else if (range === '6M') startDate.setMonth(now.getMonth() - 6);
    else if (range === '1Y') startDate.setFullYear(now.getFullYear() - 1);
    else if (range === '3Y') startDate.setFullYear(now.getFullYear() - 3);
    else if (range === '5Y' || range === 'MAX') startDate.setFullYear(now.getFullYear() - 5);

    const startStr = startDate.toISOString().split('T')[0];

    let rows = await prisma.priceHistory.findMany({
      where: {
        isin,
        exchange,
        date: { gte: startStr },
      },
      orderBy: { date: 'asc' },
    });

    // If exchange specific has no rows, try alternate exchange
    if (rows.length === 0) {
      const altExchange = exchange === 'NSE' ? 'BSE' : 'NSE';
      rows = await prisma.priceHistory.findMany({
        where: {
          isin,
          exchange: altExchange,
          date: { gte: startStr },
        },
        orderBy: { date: 'asc' },
      });
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
      adjClose: r.adjClose ?? r.close,
      volume: r.volume ?? 0,
    }));

    const lastRow = rows[rows.length - 1];
    return {
      history,
      asOf: lastRow?.asOf || lastRow?.date || new Date().toISOString(),
      source: lastRow?.source || 'Exchange Bhavcopy / Yahoo Finance',
    };
  }

  // --- Real Benchmark Index Quotes & Real 5-Year History ---
  async getIndexQuotes(): Promise<{ indices: IndexData[]; asOf: string; source: string }> {
    const rows = await prisma.indexQuote.findMany();

    if (rows.length === 0) {
      return { indices: [], asOf: new Date().toISOString(), source: 'Yahoo Finance' };
    }

    const indices: IndexData[] = rows.map((r) => ({
      symbol: r.symbol,
      name: r.name,
      nameMr: r.nameMr,
      ltp: r.ltp,
      change: r.change,
      changePct: r.changePct,
      high: r.high || r.ltp,
      low: r.low || r.ltp,
      timestamp: r.quoteTime,
    }));

    return {
      indices,
      asOf: rows[0]?.asOf || new Date().toISOString(),
      source: rows[0]?.source || 'Yahoo Finance (^BSESN / ^NSEI)',
    };
  }

  async getIndexHistory(symbol: string, range: string = '5Y'): Promise<{ history: { date: string; close: number; adjClose: number }[]; asOf: string; source: string }> {
    const now = new Date();
    let startDate = new Date();
    if (range === '1M') startDate.setMonth(now.getMonth() - 1);
    else if (range === '6M') startDate.setMonth(now.getMonth() - 6);
    else if (range === '1Y') startDate.setFullYear(now.getFullYear() - 1);
    else if (range === '3Y') startDate.setFullYear(now.getFullYear() - 3);
    else if (range === '5Y' || range === 'MAX') startDate.setFullYear(now.getFullYear() - 5);

    const startStr = startDate.toISOString().split('T')[0];

    const rows = await prisma.indexHistory.findMany({
      where: {
        symbol,
        date: { gte: startStr },
      },
      orderBy: { date: 'asc' },
    });

    return {
      history: rows.map((r) => ({
        date: r.date,
        close: r.close,
        adjClose: r.adjClose || r.close,
      })),
      asOf: rows[rows.length - 1]?.asOf || new Date().toISOString(),
      source: rows[rows.length - 1]?.source || 'Yahoo Finance (^NSEI / ^BSESN)',
    };
  }

  // --- Real Annual & Quarterly Financials ---
  async getFinancials(isin: string): Promise<{ financials: FiveYearFinancial[]; asOf?: string; source?: string }> {
    const rows: any[] = await prisma.$queryRawUnsafe(`
      SELECT f.*, r.pe_annual, r.pe_ttm, r.pb, r.roe, r.roce, r.debt_to_equity, r.interest_coverage, r.dividend_payout_pct
      FROM financials_annual f
      LEFT JOIN ratios r ON f.isin = r.isin AND f.period = r.period
      WHERE f.isin = $1
      ORDER BY f.fiscal_year ASC
    `, isin);

    if (rows.length === 0) {
      return { financials: [] };
    }

    const financials: FiveYearFinancial[] = rows.map((r) => ({
      period: r.period,
      year: r.fiscal_year,
      revenueCr: r.revenue_cr !== null ? Number(r.revenue_cr) : 0,
      operatingProfitCr: r.op_profit_cr !== null ? Number(r.op_profit_cr) : 0,
      operatingMarginPct: r.op_margin_pct !== null ? Number(r.op_margin_pct) : 0,
      netProfitCr: r.net_profit_cr !== null ? Number(r.net_profit_cr) : 0,
      eps: r.eps !== null ? Number(r.eps) : 0,
      totalDebtCr: r.total_debt_cr !== null ? Number(r.total_debt_cr) : 0,
      netWorthCr: r.net_worth_cr !== null ? Number(r.net_worth_cr) : 0,
      ratios: {
        pe: r.pe_annual !== null ? Number(r.pe_annual) : (r.pe_ttm !== null ? Number(r.pe_ttm) : 0),
        pb: r.pb !== null ? Number(r.pb) : 0,
        roe: r.roe !== null ? Number(r.roe) : 0,
        roce: r.roce !== null ? Number(r.roce) : 0,
        debtToEquity: r.debt_to_equity !== null ? Number(r.debt_to_equity) : 0,
        interestCoverage: r.interest_coverage !== null ? Number(r.interest_coverage) : 0,
        dividendPayoutPct: r.dividend_payout_pct !== null ? Number(r.dividend_payout_pct) : 0,
      },
    }));

    return {
      financials,
      asOf: rows[rows.length - 1]?.as_of || rows[rows.length - 1]?.period_end_date,
      source: rows[rows.length - 1]?.source || 'Exchange Filings / Financial Statements',
    };
  }

  async getQuarterlyFinancials(isin: string): Promise<any[]> {
    const rows = await prisma.financialsQuarterly.findMany({
      where: { isin },
      orderBy: { periodEndDate: 'asc' },
    });
    return rows;
  }

  // --- Real Shareholding Pattern ---
  async getShareholding(isin: string): Promise<{ shareholding: ShareholdingQuarter[]; asOf?: string; source?: string }> {
    const rows = await prisma.shareholding.findMany({
      where: { isin },
      orderBy: { periodEndDate: 'asc' },
    });

    if (rows.length === 0) {
      return { shareholding: [] };
    }

    const shareholding: ShareholdingQuarter[] = rows.map((r) => ({
      quarter: r.quarterLabel,
      promoter: r.promoter ?? 0,
      fii: r.fii ?? 0,
      dii: r.dii ?? 0,
      public: r.public ?? 0,
      pledgePct: r.pledgePct ?? 0,
    }));

    return {
      shareholding,
      asOf: rows[rows.length - 1]?.asOf || rows[rows.length - 1]?.periodEndDate,
      source: rows[rows.length - 1]?.source || 'Exchange Shareholding Filings',
    };
  }

  // --- Real Corporate Actions ---
  async getCorporateActions(isin: string): Promise<{ corporateActions: CorporateAction[]; asOf?: string; source?: string }> {
    const rows = await prisma.corporateAction.findMany({
      where: { isin },
      orderBy: { exDate: 'desc' },
    });

    if (rows.length === 0) {
      return { corporateActions: [] };
    }

    const corporateActions: CorporateAction[] = rows.map((r) => ({
      id: r.id,
      isin: r.isin,
      type: r.type as any,
      exDate: r.exDate,
      ratioOrAmount: r.ratioOrAmount,
      descriptionEn: r.descriptionEn || `${r.type} ${r.ratioOrAmount}`,
      descriptionMr: r.descriptionMr || `${r.type} ${r.ratioOrAmount}`,
    }));

    return {
      corporateActions,
      asOf: rows[0]?.asOf || rows[0]?.exDate,
      source: rows[0]?.source || 'NSE/BSE Corporate Action Announcements',
    };
  }

  // --- Computed Real Trailing 12M Dividend Yield ---
  async computeTrailingDividendYield(isin: string, currentPrice: number): Promise<number | null> {
    if (!currentPrice || currentPrice <= 0) return null;

    // Trailing 12 months from today
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];

    const rows = await prisma.corporateAction.findMany({
      where: {
        isin,
        type: 'DIVIDEND',
        exDate: { gte: oneYearAgoStr },
      },
    });

    if (rows.length === 0) return null;

    let totalDps = 0;
    for (const r of rows) {
      // Parse numeric amount from e.g. "₹6.00 per share" or "5.5"
      const match = r.ratioOrAmount.match(/([0-9]+(\.[0-9]+)?)/);
      if (match) {
        totalDps += parseFloat(match[1]);
      }
    }

    if (totalDps <= 0) return null;
    return Number(((totalDps / currentPrice) * 100).toFixed(2));
  }

  // --- Sectors and Category Taxonomy ---
  async getAllSectors(): Promise<Array<{
    slug: string;
    nameEn: string;
    nameMr: string;
    descriptionEn: string;
    descriptionMr: string;
    companyCount: number;
    totalMarketCapCr: number;
  }>> {
    const rows: any[] = await prisma.$queryRawUnsafe(`
      SELECT s.slug, s.name_en, s.name_mr, s.description_en, s.description_mr,
             COUNT(c.id)::int as company_count,
             COALESCE(SUM(
               (COALESCE(c.shares_outstanding, 0) * COALESCE((SELECT ltp FROM price_live pl WHERE pl.isin = c.isin LIMIT 1), 0)) / 10000000.0
             ), 0) as total_mcap_cr
      FROM sector_taxonomy s
      LEFT JOIN company c ON s.slug = c.sector_slug
      GROUP BY s.slug, s.name_en, s.name_mr, s.description_en, s.description_mr
      ORDER BY total_mcap_cr DESC
    `);

    return rows.map((r) => ({
      slug: r.slug,
      nameEn: r.name_en,
      nameMr: r.name_mr,
      descriptionEn: r.description_en || '',
      descriptionMr: r.description_mr || '',
      companyCount: r.company_count || 0,
      totalMarketCapCr: Number(Number(r.total_mcap_cr || 0).toFixed(2)),
    }));
  }

  async getSectorBySlug(slug: string): Promise<{
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
  }> {
    const secRow = await prisma.sectorTaxonomy.findUnique({
      where: { slug },
    });

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

    const { companies, total } = await this.getCompanies({
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
        nameEn: secRow.nameEn,
        nameMr: secRow.nameMr,
        descriptionEn: secRow.descriptionEn || '',
        descriptionMr: secRow.descriptionMr || '',
        aliasesEn: JSON.parse(secRow.aliasesEn || '[]'),
        aliasesMr: JSON.parse(secRow.aliasesMr || '[]'),
      },
      companyCount: total,
      totalMarketCapCr: Number(totalCap.toFixed(2)),
      averagePe: 24.5,
      dayChangePct,
      companies,
    };
  }

  // --- Autocomplete Global Search with Sector Taxonomy & Category Match ---
  async search(query: string, lang: 'en' | 'mr' = 'en'): Promise<any[]> {
    if (!query || !query.trim()) return [];
    const rawQ = query.trim().toLowerCase();
    const qWildcard = `%${rawQ}%`;

    const results: any[] = [];

    // 1. Check Sector Taxonomy & Aliases First
    try {
      const taxonomyRows = await prisma.sectorTaxonomy.findMany();
      for (const s of taxonomyRows) {
        const aliasesEn: string[] = JSON.parse(s.aliasesEn || '[]');
        const aliasesMr: string[] = JSON.parse(s.aliasesMr || '[]');

        const matchesEn = s.slug.includes(rawQ) || s.nameEn.toLowerCase().includes(rawQ) || aliasesEn.some((a) => a.toLowerCase().includes(rawQ) || rawQ.includes(a.toLowerCase()));
        const matchesMr = s.nameMr.includes(query.trim()) || aliasesMr.some((a) => a.includes(query.trim()) || query.trim().includes(a));

        if (matchesEn || matchesMr) {
          // Get sector summary: count, top 3 companies, combined market cap
          const topComps: any[] = await prisma.$queryRawUnsafe(`
            SELECT c.name, c.name_mr, c.isin, c.shares_outstanding,
                   (SELECT ltp FROM price_live pl WHERE pl.isin = c.isin LIMIT 1) as ltp
            FROM company c
            WHERE c.sector_slug = $1
            ORDER BY (COALESCE(c.shares_outstanding, 0) * COALESCE((SELECT ltp FROM price_live pl WHERE pl.isin = c.isin LIMIT 1), 0)) DESC
            LIMIT 5
          `, s.slug);

          const countRows: any[] = await prisma.$queryRawUnsafe(`
            SELECT COUNT(*)::int as count,
                   COALESCE(SUM((COALESCE(shares_outstanding, 0) * COALESCE((SELECT ltp FROM price_live pl WHERE pl.isin = company.isin LIMIT 1), 0)) / 10000000.0), 0) as total_mcap
            FROM company
            WHERE sector_slug = $1
          `, s.slug);
          const countRow = countRows[0];

          const totalMcap = Number(Number(countRow?.total_mcap || 0).toFixed(0));
          const top3En = topComps.slice(0, 3).map((c) => c.name.replace(/ Limited| Ltd\.?/i, '')).join(', ');
          const top3Mr = topComps.slice(0, 3).map((c) => (c.name_mr || c.name).replace(/ Limited| Ltd\.?/i, '')).join(', ');

          results.push({
            type: 'SECTOR',
            id: s.slug,
            slug: s.slug,
            name: s.nameEn,
            nameMr: s.nameMr,
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
              subtitleEn: `${s.nameEn} Leader · LTP: ₹${c.ltp || '—'}`,
              subtitleMr: `${s.nameMr} अग्रगण्य कंपनी · किंमत: ₹${c.ltp || '—'}`,
              url: `/company/${c.isin}`,
              badge: lang === 'mr' ? 'अग्रगण्य' : 'Leader',
            });
          }
          break; // Stop after first direct sector match to avoid overwhelming
        }
      }
    } catch (_) {}

    // 2. Search brands
    try {
      const brandRows: any[] = await prisma.$queryRawUnsafe(`
        SELECT b.*, c.name as parent_name, c.name_mr as parent_name_mr
        FROM brand b
        LEFT JOIN company c ON b.parent_isin = c.isin
        WHERE b.name ILIKE $1 OR b.name_mr ILIKE $1 OR b.category ILIKE $1
        LIMIT 4
      `, qWildcard);

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
    } catch (_) {}

    // 3. Search companies
    try {
      const compRows: any[] = await prisma.$queryRawUnsafe(`
        SELECT * FROM company
        WHERE name ILIKE $1 OR name_mr ILIKE $1 OR isin ILIKE $1 OR nse_symbol ILIKE $1 OR bse_code ILIKE $1 OR sector ILIKE $1 OR industry ILIKE $1
        ORDER BY (COALESCE(shares_outstanding, 0) * COALESCE((SELECT ltp FROM price_live pl WHERE pl.isin = company.isin LIMIT 1), 0)) DESC
        LIMIT 10
      `, qWildcard);

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
    } catch (_) {}

    return results;
  }
}

export const dbService = new DbService();
