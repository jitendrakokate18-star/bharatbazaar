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
import {
  StockDataProvider,
  DirectoryFilters,
  SearchResult,
  ProvenanceWrapper,
} from './dataProvider';
import { dbService } from '../dbService';

export class RealFreeProvider implements StockDataProvider {
  async getCompany(isin: string): Promise<Company | null> {
    return dbService.getCompanyByIsin(isin);
  }

  async getAllCompanies(filters?: DirectoryFilters): Promise<{ companies: Company[]; total: number }> {
    return dbService.getCompanies(filters);
  }

  async getCompanyProfile(isin: string, locale: Locale = 'en'): Promise<ProvenanceWrapper<CompanyProfile | null>> {
    const profile = dbService.getCompanyProfile(isin, locale);
    return {
      data: profile,
      asOf: profile?.asOf || new Date().toISOString(),
      source: profile?.source || 'Exchange Filings / Company Disclosures',
      isDelayed: false,
    };
  }

  async getBrandsByCompany(companyId: string): Promise<ProvenanceWrapper<Brand[]>> {
    const brands = dbService.getBrandsByCompany(companyId);
    return {
      data: brands,
      asOf: brands[0]?.asOf || new Date().toISOString(),
      source: brands[0]?.source || 'Curated Brand Master / Corporate Disclosures',
    };
  }

  async getBrand(brandId: string): Promise<ProvenanceWrapper<Brand | null>> {
    const brand = dbService.getBrandById(brandId);
    return {
      data: brand,
      asOf: brand?.asOf || new Date().toISOString(),
      source: brand?.source || 'Curated Brand Master',
    };
  }

  async search(query: string, lang: Locale = 'en'): Promise<SearchResult[]> {
    return dbService.search(query, lang);
  }

  async getLivePrice(isin: string): Promise<DualExchangePrice & { isSampleData?: boolean }> {
    return dbService.getLivePrice(isin);
  }

  async getHistoricalOHLCV(isin: string, range: string = '5Y', exchange: Exchange = 'NSE'): Promise<ProvenanceWrapper<OHLCPoint[]>> {
    const res = dbService.getPriceHistory(isin, range, exchange);
    return {
      data: res.history,
      asOf: res.asOf,
      source: res.source,
      isDelayed: true,
    };
  }

  async getIndexQuotes(): Promise<ProvenanceWrapper<IndexData[]>> {
    const res = dbService.getIndexQuotes();
    return {
      data: res.indices,
      asOf: res.asOf,
      source: res.source,
      isDelayed: true,
    };
  }

  async getIndexHistory(symbol: string, range: string = '5Y'): Promise<ProvenanceWrapper<{ date: string; close: number; adjClose: number }[]>> {
    const res = dbService.getIndexHistory(symbol, range);
    return {
      data: res.history,
      asOf: res.asOf,
      source: res.source,
      isDelayed: true,
    };
  }

  async getFinancials(isin: string): Promise<ProvenanceWrapper<FiveYearFinancial[]>> {
    const res = dbService.getFinancials(isin);
    return {
      data: res.financials,
      asOf: res.asOf || '',
      source: res.source || 'Exchange Financial Results (Consolidated)',
    };
  }

  async getQuarterlyFinancials(isin: string): Promise<ProvenanceWrapper<any[]>> {
    const data = dbService.getQuarterlyFinancials(isin);
    return {
      data,
      asOf: data[data.length - 1]?.as_of || '',
      source: 'Exchange Financial Results Filings',
    };
  }

  async getShareholding(isin: string): Promise<ProvenanceWrapper<ShareholdingQuarter[]>> {
    const res = dbService.getShareholding(isin);
    return {
      data: res.shareholding,
      asOf: res.asOf || '',
      source: res.source || 'Exchange Shareholding Pattern Disclosures',
    };
  }

  async getCorporateActions(isin: string): Promise<ProvenanceWrapper<CorporateAction[]>> {
    const res = dbService.getCorporateActions(isin);
    return {
      data: res.corporateActions,
      asOf: res.asOf || '',
      source: res.source || 'NSE/BSE Corporate Action Disclosures',
    };
  }

  async getTrailingDividendYield(isin: string, currentPrice: number): Promise<number | null> {
    return dbService.computeTrailingDividendYield(isin, currentPrice);
  }
}

export const realFreeProvider = new RealFreeProvider();
