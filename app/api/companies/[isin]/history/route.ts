import { NextRequest, NextResponse } from 'next/server';
import { defaultDataProvider } from '@/lib/providers';
import { Exchange } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { isin: string } }
) {
  const { isin } = params;
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || '5Y';
  const exchange = (searchParams.get('exchange') || 'NSE') as Exchange;

  const res = await defaultDataProvider.getHistoricalOHLCV(isin, range, exchange);
  return NextResponse.json({
    history: res.data,
    asOf: res.asOf,
    source: res.source,
  });
}
