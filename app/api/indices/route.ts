import { NextRequest, NextResponse } from 'next/server';
import { defaultDataProvider } from '@/lib/providers';
import { getMarketStatus } from '@/lib/dates';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const range = searchParams.get('range') || '5Y';

  // If a specific symbol history is requested
  if (symbol) {
    const history = await defaultDataProvider.getIndexHistory(symbol, range);
    return NextResponse.json({
      symbol,
      history: history.data,
      asOf: history.asOf,
      source: history.source,
      delayed: true,
    });
  }

  // Otherwise return real index quotes from database
  const res = await defaultDataProvider.getIndexQuotes();
  const marketStatus = getMarketStatus();

  return NextResponse.json({
    indices: res.data,
    asOf: res.asOf,
    source: res.source,
    delayed: true,
    marketStatus,
  });
}
