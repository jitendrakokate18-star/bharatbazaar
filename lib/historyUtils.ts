import type { OHLCPoint, CorporateAction, Company } from '../types/index.ts';

/**
 * Calculates CAGR (Compound Annual Growth Rate) in percentage.
 */
export function calculateCAGR(startPrice: number, endPrice: number, years: number): number {
  if (startPrice <= 0 || endPrice <= 0 || years <= 0) return 0;
  const cagr = Math.pow(endPrice / startPrice, 1 / years) - 1;
  return Number((cagr * 100).toFixed(2));
}

/**
 * Calculates Absolute Return in percentage.
 */
export function calculateAbsoluteReturn(startPrice: number, endPrice: number): number {
  if (startPrice <= 0) return 0;
  const absReturn = ((endPrice - startPrice) / startPrice) * 100;
  return Number(absReturn.toFixed(2));
}

/**
 * Adjusts raw historical OHLC prices backwards for corporate actions (splits and bonus issues).
 * For example, a 1:1 bonus issue (factor 2.0) requires dividing pre-ex-date prices by 2.
 */
export function adjustOHLCForCorporateActions(
  series: OHLCPoint[],
  corporateActions: CorporateAction[]
): OHLCPoint[] {
  if (!corporateActions || corporateActions.length === 0) {
    return series.map((pt) => ({ ...pt, adjClose: pt.close }));
  }

  // Parse split and bonus factors
  const adjustments = corporateActions
    .filter((ca) => ca.type === 'SPLIT' || ca.type === 'BONUS')
    .map((ca) => {
      let factor = 1.0;
      if (ca.type === 'SPLIT') {
        // e.g. "1:10" or "10:1" -> ratio of new shares per old share
        const parts = ca.ratioOrAmount.split(':').map((s) => parseFloat(s.trim()));
        if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
          factor = Math.max(parts[0], parts[1]) / Math.min(parts[0], parts[1]);
        }
      } else if (ca.type === 'BONUS') {
        // e.g. "1:1" bonus means 1 bonus share for each 1 held -> total shares = 2 -> factor = 2
        const parts = ca.ratioOrAmount.split(':').map((s) => parseFloat(s.trim()));
        if (parts.length === 2 && parts[1] > 0) {
          factor = (parts[0] + parts[1]) / parts[1];
        }
      }
      return {
        exDate: ca.exDate,
        factor,
      };
    })
    .sort((a, b) => (a.exDate > b.exDate ? 1 : -1));

  return series.map((pt) => {
    let cumulativeFactor = 1.0;
    for (const adj of adjustments) {
      if (pt.date < adj.exDate) {
        cumulativeFactor *= adj.factor;
      }
    }

    const adjClose = Number((pt.close / cumulativeFactor).toFixed(2));
    return {
      ...pt,
      adjClose,
    };
  });
}

/**
 * Merges NSE and BSE listings based on unique master key ISIN.
 * If a company exists in both, both symbols/codes are kept.
 */
export function mergeCompanyRecordsByISIN(
  existingCompanies: Company[],
  incomingCompanies: Partial<Company>[]
): Company[] {
  const map = new Map<string, Company>();

  for (const comp of existingCompanies) {
    map.set(comp.isin, { ...comp });
  }

  for (const inc of incomingCompanies) {
    if (!inc.isin) continue;

    if (map.has(inc.isin)) {
      const current = map.get(inc.isin)!;
      map.set(inc.isin, {
        ...current,
        nseSymbol: inc.nseSymbol || current.nseSymbol,
        bseCode: inc.bseCode || current.bseCode,
        name: current.name || inc.name || '',
        nameMr: current.nameMr || inc.nameMr || current.name || '',
        sector: current.sector || inc.sector || 'General',
        sectorMr: current.sectorMr || inc.sectorMr || current.sector || 'सामान्य',
        hasBrands: current.hasBrands || inc.hasBrands || false,
      });
    } else {
      map.set(inc.isin, inc as Company);
    }
  }

  return Array.from(map.values());
}
