import { NextRequest, NextResponse } from 'next/server';
import { defaultDataProvider } from '@/lib/providers';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
  } catch (err: any) {
    console.error('Error in /api/brands/[id]:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
