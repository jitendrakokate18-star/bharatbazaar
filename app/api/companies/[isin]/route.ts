import { NextRequest, NextResponse } from 'next/server';
import { defaultDataProvider } from '@/lib/providers';

export async function GET(
  request: NextRequest,
  { params }: { params: { isin: string } }
) {
  const { isin } = params;

  const company = await defaultDataProvider.getCompany(isin);
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  const [profileRes, brandsRes, livePrice, shareholdingRes, corporateActionsRes] = await Promise.all([
    defaultDataProvider.getCompanyProfile(isin),
    defaultDataProvider.getBrandsByCompany(company.id),
    defaultDataProvider.getLivePrice(isin),
    defaultDataProvider.getShareholding(isin),
    defaultDataProvider.getCorporateActions(isin),
  ]);

  const currentPrice = livePrice.nse?.ltp || livePrice.bse?.ltp || 0;
  const trailingDividendYield = await defaultDataProvider.getTrailingDividendYield(isin, currentPrice);

  return NextResponse.json({
    company,
    profile: profileRes.data,
    profileMeta: { asOf: profileRes.asOf, source: profileRes.source },
    brands: brandsRes.data,
    brandsMeta: { asOf: brandsRes.asOf, source: brandsRes.source },
    livePrice,
    shareholding: shareholdingRes.data,
    shareholdingMeta: { asOf: shareholdingRes.asOf, source: shareholdingRes.source },
    corporateActions: corporateActionsRes.data,
    corporateActionsMeta: { asOf: corporateActionsRes.asOf, source: corporateActionsRes.source },
    trailingDividendYield,
  });
}
