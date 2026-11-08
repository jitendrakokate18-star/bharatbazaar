export type Locale = 'en' | 'mr';

export type Exchange = 'NSE' | 'BSE';

export type MarketCapCategory = 'large' | 'mid' | 'small';

export interface Company {
  id: string;
  isin: string; // Master unique key
  name: string;
  nameMr: string; // Marathi transliteration (e.g. 'टाटा मोटर्स लिमिटेड')
  nseSymbol?: string;
  bseCode?: string;
  sector: string;
  sectorMr: string;
  sectorSlug?: string;
  industry: string;
  industryMr: string;
  listingDate: string;
  status: 'ACTIVE' | 'SUSPENDED';
  website: string;
  logoUrl?: string;
  hasBrands: boolean;
  marketCapCategory: MarketCapCategory;
  marketCapCr: number; // In Crore
  asOf?: string;
  source?: string;
  isDelayed?: boolean;
}

export interface CompanyProfile {
  companyId: string;
  isin: string;
  foundedYear: number;
  headquarters: string;
  headquartersMr: string;
  founders: string[];
  foundersMr: string[];
  management: {
    title: string;
    titleMr: string;
    name: string;
    nameMr: string;
  }[];
  descriptionEn: string;
  descriptionMr: string;
  historyEn: string;
  historyMr: string;
  segmentsEn: string[];
  segmentsMr: string[];
  subsidiariesEn: string[];
  subsidiariesMr: string[];
  milestones: {
    year: number;
    eventEn: string;
    eventMr: string;
  }[];
  asOf?: string;
  source?: string;
}

export interface Brand {
  id: string;
  parentCompanyId: string;
  parentIsin: string;
  parentCompanyName: string;
  parentCompanyNameMr: string;
  name: string;
  nameMr: string;
  category: string;
  categoryMr: string;
  launchYear: number;
  logoUrl?: string;
  owningEntityId?: string; // If owned by listed subsidiary
  descriptionEn: string;
  descriptionMr: string;
  positioningEn: string;
  positioningMr: string;
  asOf?: string;
  source?: string;
  keyProductsEn: string[];
  keyProductsMr: string[];
  notableFactsEn: string[];
  notableFactsMr: string[];
}

export interface LivePriceTick {
  isin: string;
  exchange: Exchange;
  ltp: number; // Last Traded Price
  change: number;
  changePct: number;
  volume: number;
  dayHigh: number;
  dayLow: number;
  open: number;
  prevClose: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  timestamp: string; // ISO String
  isDelayed?: boolean;
  as_of?: string;
  source?: string;
}

export interface DualExchangePrice {
  isin: string;
  nse?: LivePriceTick;
  bse?: LivePriceTick;
  lastUpdated: string;
  isSampleData?: boolean;
}

export interface OHLCPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;
  volume: number;
}

export interface FiveYearFinancial {
  period: string; // e.g. "FY24"
  year: number;
  revenueCr: number;
  operatingProfitCr: number;
  operatingMarginPct: number;
  netProfitCr: number;
  eps: number;
  totalDebtCr: number;
  netWorthCr: number;
  ratios: {
    pe: number;
    pb: number;
    roe: number;
    roce: number;
    debtToEquity: number;
    interestCoverage: number;
    dividendPayoutPct: number;
  };
}

export interface ShareholdingQuarter {
  quarter: string; // e.g. "Q2 FY27"
  promoter: number;
  fii: number;
  dii: number;
  public: number;
  pledgePct: number;
}

export interface CorporateAction {
  id: string;
  isin: string;
  type: 'DIVIDEND' | 'SPLIT' | 'BONUS' | 'RIGHTS';
  exDate: string;
  ratioOrAmount: string;
  descriptionEn: string;
  descriptionMr: string;
}

export interface IndexData {
  symbol: string;
  name: string;
  nameMr: string;
  ltp: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  timestamp: string;
}

export interface MarketStatus {
  status: 'OPEN' | 'CLOSED' | 'PRE_OPEN' | 'WEEKEND';
  messageEn: string;
  messageMr: string;
  nextChange: string;
  istTime: string;
}
