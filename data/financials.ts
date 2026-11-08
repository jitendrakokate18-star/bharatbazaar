import { FiveYearFinancial, ShareholdingQuarter, CorporateAction } from '@/types';

// Deprecated: Production code reads from real database via DbService / RealFreeProvider
export const COMPANY_FINANCIALS: Record<string, FiveYearFinancial[]> = {};
export const COMPANY_SHAREHOLDING: Record<string, ShareholdingQuarter[]> = {};
export const CORPORATE_ACTIONS: Record<string, CorporateAction[]> = {};
