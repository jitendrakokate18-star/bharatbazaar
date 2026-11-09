import { NextRequest, NextResponse } from 'next/server';
import { defaultDataProvider } from '@/lib/providers';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { isin: string } }
) {
  try {
    const { isin } = params;
    const res = await defaultDataProvider.getFinancials(isin);
    return NextResponse.json({
      financials: res.data,
      asOf: res.asOf,
      source: res.source,
    });
  } catch (err: any) {
    console.error('Error in /api/companies/[isin]/financials:', err);
    return NextResponse.json({ financials: [] });
  }
}
