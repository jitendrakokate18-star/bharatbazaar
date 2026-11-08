import {
  Company,
  CompanyProfile,
  Brand,
  DualExchangePrice,
  OHLCPoint,
  FiveYearFinancial,
  ShareholdingQuarter,
  CorporateAction,
  IndexData,
  Locale,
  Exchange,
} from '@/types';

export interface DirectoryFilters {
  search?: string;
  exchange?: 'ALL' | 'NSE' | 'BSE';
  sector?: string;
  marketCapCategory?: 'all' | 'large' | 'mid' | 'small';
  hasBrandsOnly?: boolean;
  sortBy?: 'marketCapDesc' | 'marketCapAsc' | 'nameAsc' | 'gainers' | 'losers';
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  type: 'COMPANY' | 'BRAND' | 'SECTOR';
  id: string;
  isin?: string;
  slug?: string;
  name: string;
  nameMr: string;
  subtitleEn: string;
  subtitleMr: string;
  url: string;
  badge?: string;
  count?: number;
  combinedMarketCapCr?: number;
  topCompanies?: string[];
}

export interface ProvenanceWrapper<T> {
  data: T;
  asOf: string;
  source: string;
  isDelayed?: boolean;
  isStale?: boolean;
  isSampleData?: boolean;
}

export interface CompanyMasterProvider {
  getCompany(isin: string): Promise<Company | null>;
  getAllCompanies(filters?: DirectoryFilters): Promise<{ companies: Company[]; total: number }>;
  getCompanyProfile(isin: string, locale?: Locale): Promise<ProvenanceWrapper<CompanyProfile | null>>;
  getBrandsByCompany(companyId: string): Promise<ProvenanceWrapper<Brand[]>>;
  getBrand(brandId: string): Promise<ProvenanceWrapper<Brand | null>>;
  search(query: string, lang: Locale): Promise<SearchResult[]>;
}

export interface MarketDataProvider {
  getLivePrice(isin: string): Promise<DualExchangePrice & { isSampleData?: boolean }>;
  getHistoricalOHLCV(isin: string, range?: string, exchange?: Exchange): Promise<ProvenanceWrapper<OHLCPoint[]>>;
}

export interface IndexProvider {
  getIndexQuotes(): Promise<ProvenanceWrapper<IndexData[]>>;
  getIndexHistory(symbol: string, range?: string): Promise<ProvenanceWrapper<{ date: string; close: number; adjClose: number }[]>>;
}

export interface FundamentalsProvider {
  getFinancials(isin: string): Promise<ProvenanceWrapper<FiveYearFinancial[]>>;
  getQuarterlyFinancials(isin: string): Promise<ProvenanceWrapper<any[]>>;
}

export interface ShareholdingProvider {
  getShareholding(isin: string): Promise<ProvenanceWrapper<ShareholdingQuarter[]>>;
}

export interface CorporateActionProvider {
  getCorporateActions(isin: string): Promise<ProvenanceWrapper<CorporateAction[]>>;
  getTrailingDividendYield(isin: string, currentPrice: number): Promise<number | null>;
}

export interface StockDataProvider
  extends CompanyMasterProvider,
    MarketDataProvider,
    IndexProvider,
    FundamentalsProvider,
    ShareholdingProvider,
    CorporateActionProvider {}
