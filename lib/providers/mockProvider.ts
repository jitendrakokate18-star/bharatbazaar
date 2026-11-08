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

export class MockStockDataProvider implements StockDataProvider {
  async getCompany(isin: string): Promise<Company | null> {
    return {
      id: 'mock-sample',
      isin,
      name: 'Sample Mock Corporation',
      nameMr: 'सॅम्पल मॉक कॉर्पोरेशन',
      nseSymbol: 'SAMPLE',
      bseCode: '999999',
      sector: 'Sample Sector',
      sectorMr: 'नमुना क्षेत्र',
      industry: 'Sample Industry',
      industryMr: 'नमुना उद्योग',
      listingDate: '2020-01-01',
      status: 'ACTIVE',
      website: '',
      hasBrands: false,
      marketCapCategory: 'mid',
      marketCapCr: 0,
    };
  }

  async getAllCompanies(filters?: DirectoryFilters): Promise<{ companies: Company[]; total: number }> {
    return { companies: [], total: 0 };
  }

  async getCompanyProfile(isin: string, locale: Locale = 'en'): Promise<ProvenanceWrapper<CompanyProfile | null>> {
    return {
      data: null,
      asOf: new Date().toISOString(),
      source: 'SAMPLE DATA (Mock Mode)',
      isSampleData: true,
    };
  }

  async getBrandsByCompany(companyId: string): Promise<ProvenanceWrapper<Brand[]>> {
    return {
      data: [],
      asOf: new Date().toISOString(),
      source: 'SAMPLE DATA (Mock Mode)',
      isSampleData: true,
    };
  }

  async getBrand(brandId: string): Promise<ProvenanceWrapper<Brand | null>> {
    return {
      data: null,
      asOf: new Date().toISOString(),
      source: 'SAMPLE DATA (Mock Mode)',
      isSampleData: true,
    };
  }

  async search(query: string, lang: Locale = 'en'): Promise<SearchResult[]> {
    return [];
  }

  async getLivePrice(isin: string): Promise<DualExchangePrice & { isSampleData?: boolean }> {
    return {
      isin,
      lastUpdated: new Date().toISOString(),
      isSampleData: true,
    };
  }

  async getHistoricalOHLCV(isin: string, range: string = '5Y', exchange: Exchange = 'NSE'): Promise<ProvenanceWrapper<OHLCPoint[]>> {
    return {
      data: [],
      asOf: new Date().toISOString(),
      source: 'SAMPLE DATA (Mock Mode)',
      isSampleData: true,
    };
  }

  async getIndexQuotes(): Promise<ProvenanceWrapper<IndexData[]>> {
    return {
      data: [],
      asOf: new Date().toISOString(),
      source: 'SAMPLE DATA (Mock Mode)',
      isSampleData: true,
    };
  }

  async getIndexHistory(symbol: string, range: string = '5Y'): Promise<ProvenanceWrapper<{ date: string; close: number; adjClose: number }[]>> {
    return {
      data: [],
      asOf: new Date().toISOString(),
      source: 'SAMPLE DATA (Mock Mode)',
      isSampleData: true,
    };
  }

  async getFinancials(isin: string): Promise<ProvenanceWrapper<FiveYearFinancial[]>> {
    return {
      data: [],
      asOf: new Date().toISOString(),
      source: 'SAMPLE DATA (Mock Mode)',
      isSampleData: true,
    };
  }

  async getQuarterlyFinancials(isin: string): Promise<ProvenanceWrapper<any[]>> {
    return {
      data: [],
      asOf: new Date().toISOString(),
      source: 'SAMPLE DATA (Mock Mode)',
      isSampleData: true,
    };
  }

  async getShareholding(isin: string): Promise<ProvenanceWrapper<ShareholdingQuarter[]>> {
    return {
      data: [],
      asOf: new Date().toISOString(),
      source: 'SAMPLE DATA (Mock Mode)',
      isSampleData: true,
    };
  }

  async getCorporateActions(isin: string): Promise<ProvenanceWrapper<CorporateAction[]>> {
    return {
      data: [],
      asOf: new Date().toISOString(),
      source: 'SAMPLE DATA (Mock Mode)',
      isSampleData: true,
    };
  }

  async getTrailingDividendYield(isin: string, currentPrice: number): Promise<number | null> {
    return null;
  }
}

export const mockStockDataProvider = new MockStockDataProvider();
