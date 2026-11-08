import { NextRequest, NextResponse } from 'next/server';
import { defaultDataProvider } from '@/lib/providers';

export async function GET(
  request: NextRequest,
  { params }: { params: { isin: string } }
) {
  const { isin } = params;
  const res = await defaultDataProvider.getFinancials(isin);
  return NextResponse.json({
    financials: res.data,
    asOf: res.asOf,
    source: res.source,
  });
}
