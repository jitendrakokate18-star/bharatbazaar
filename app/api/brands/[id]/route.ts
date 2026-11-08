import { NextRequest, NextResponse } from 'next/server';
import { defaultDataProvider } from '@/lib/providers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const brandRes = await defaultDataProvider.getBrand(id);
  if (!brandRes.data) {
    return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
  }

  const brand = brandRes.data;
  const [parentCompany, livePrice, historyRes] = await Promise.all([
    defaultDataProvider.getCompany(brand.parentIsin),
    defaultDataProvider.getLivePrice(brand.parentIsin),
    defaultDataProvider.getHistoricalOHLCV(brand.parentIsin, '5Y', 'NSE'),
  ]);

  return NextResponse.json({
    brand,
    brandMeta: { asOf: brandRes.asOf, source: brandRes.source },
    parentCompany,
    livePrice,
    fiveYearSummary: (historyRes.data || []).slice(-10),
  });
}
