import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ isin: string }> }
) {
  try {
    const { isin } = await params;

    const company = await prisma.company.findUnique({
      where: { isin },
      select: { isin: true, nseSymbol: true, bseCode: true, bseScripId: true },
    });
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Trigger non-blocking async hydration if ticker available
    const ticker = company.nseSymbol
      ? `${company.nseSymbol}.NS`
      : company.bseScripId
      ? `${company.bseScripId}.BO`
      : company.bseCode
      ? `${company.bseCode}.BO`
      : null;

    if (ticker) {
      // Fire-and-forget hydration
      (async () => {
        try {
          const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=5y&interval=1d`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
          });
          if (res.ok) {
            const data = await res.json();
            const result = data?.chart?.result?.[0];
            if (result?.timestamp && result?.indicators?.quote?.[0]) {
              const timestamps = result.timestamp;
              const quotes = result.indicators.quote[0];
              const exchange = company.nseSymbol ? 'NSE' : 'BSE';

              const records: any[] = [];
              for (let i = 0; i < timestamps.length; i++) {
                const d = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
                const c = quotes.close?.[i];
                if (c !== null && c !== undefined) {
                  records.push({
                    id: `${isin}-${exchange}-${d}`,
                    isin,
                    exchange,
                    date: d,
                    open: quotes.open?.[i] || c,
                    high: quotes.high?.[i] || c,
                    low: quotes.low?.[i] || c,
                    close: c,
                    adjClose: c,
                    volume: quotes.volume?.[i] || 0,
                    deliveryPct: 0,
                    asOf: d,
                    source: 'On-Demand Hydration Feed',
                  });
                }
              }

              if (records.length > 0) {
                await prisma.priceHistory.createMany({
                  data: records,
                  skipDuplicates: true,
                });
              }
            }
          }
        } catch (_) {}
      })();
    }

    return NextResponse.json({
      status: 'HYDRATING',
      isin,
      message: 'On-demand background hydration triggered successfully.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
