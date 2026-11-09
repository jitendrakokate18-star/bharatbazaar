import { prisma } from '../lib/prisma.ts';

interface IndexMeta {
  symbol: string;
  name: string;
  nameMr: string;
}

const INDICES: IndexMeta[] = [
  { symbol: '^BSESN', name: 'BSE SENSEX', nameMr: 'बीएसई सेन्सेक्स' },
  { symbol: '^NSEI', name: 'NIFTY 50', nameMr: 'निफ्टी ५०' },
  { symbol: '^NSEBANK', name: 'NIFTY BANK', nameMr: 'निफ्टी बँक' },
  { symbol: '^CNXIT', name: 'NIFTY IT', nameMr: 'निफ्टी आयटी' },
];

export async function ingestIndices(fetchHistory = true) {
  console.log('Ingesting real live quotes and 5-year history for Indian Benchmark Indices into PostgreSQL...');

  for (const idx of INDICES) {
    try {
      console.log(`Fetching quote & history for ${idx.name} (${idx.symbol})...`);
      const range = fetchHistory ? '5y' : '5d';
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(idx.symbol)}?range=${range}&interval=1d`;

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        console.warn(`Failed to fetch ${idx.symbol}: HTTP ${res.status}`);
        continue;
      }

      const json = await res.json();
      const result = json?.chart?.result?.[0];
      if (!result) continue;

      const meta = result.meta;
      const ltp = meta.regularMarketPrice;
      const prevClose = meta.chartPreviousClose || meta.previousClose || ltp;
      const change = Number((ltp - prevClose).toFixed(2));
      const changePct = prevClose > 0 ? Number(((change / prevClose) * 100).toFixed(2)) : 0;
      const high = meta.regularMarketDayHigh || ltp;
      const low = meta.regularMarketDayLow || ltp;
      const quoteTime = new Date(meta.regularMarketTime * 1000).toISOString();
      const asOf = quoteTime;

      // Upsert Quote
      await prisma.indexQuote.upsert({
        where: { symbol: idx.symbol },
        create: {
          symbol: idx.symbol,
          name: idx.name,
          nameMr: idx.nameMr,
          ltp,
          change,
          changePct,
          high,
          low,
          prevClose,
          quoteTime,
          asOf,
          source: 'Yahoo Finance (Exchange Feed)',
          delayed: 1,
        },
        update: {
          ltp,
          change,
          changePct,
          high,
          low,
          prevClose,
          quoteTime,
          asOf,
          source: 'Yahoo Finance (Exchange Feed)',
        },
      });

      // Also upsert short alias key like SENSEX and NIFTY50 so legacy lookups succeed
      const shortSymbol = idx.symbol === '^BSESN' ? 'SENSEX' : idx.symbol === '^NSEI' ? 'NIFTY50' : idx.symbol;
      if (shortSymbol !== idx.symbol) {
        await prisma.indexQuote.upsert({
          where: { symbol: shortSymbol },
          create: {
            symbol: shortSymbol,
            name: idx.name,
            nameMr: idx.nameMr,
            ltp,
            change,
            changePct,
            high,
            low,
            prevClose,
            quoteTime,
            asOf,
            source: 'Yahoo Finance (Exchange Feed)',
            delayed: 1,
          },
          update: {
            ltp,
            change,
            changePct,
            high,
            low,
            prevClose,
            quoteTime,
            asOf,
            source: 'Yahoo Finance (Exchange Feed)',
          },
        });
      }

      // Upsert Historical OHLCV
      if (fetchHistory && result.timestamp && result.indicators?.quote?.[0]) {
        const timestamps = result.timestamp;
        const quotes = result.indicators.quote[0];
        const adjCloses = result.indicators?.adjclose?.[0]?.adjclose || quotes.close;

        const histRecords: any[] = [];
        for (let i = 0; i < timestamps.length; i++) {
          const date = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
          const open = quotes.open?.[i] || quotes.close?.[i];
          const h = quotes.high?.[i] || quotes.close?.[i];
          const l = quotes.low?.[i] || quotes.close?.[i];
          const close = quotes.close?.[i];
          const adjClose = adjCloses?.[i] || close;
          const volume = quotes.volume?.[i] || 0;

          if (close !== null && close !== undefined) {
            histRecords.push({
              id: `${idx.symbol}-${date}`,
              symbol: idx.symbol,
              date,
              open,
              high: h,
              low: l,
              close,
              adjClose,
              volume,
              asOf,
              source: 'Yahoo Finance (Exchange Feed)',
            });
          }
        }

        if (histRecords.length > 0) {
          await prisma.indexHistory.createMany({
            data: histRecords,
            skipDuplicates: true,
          });
          console.log(`Saved ${histRecords.length} daily historical points for ${idx.symbol}.`);
        }
      }
    } catch (err: any) {
      console.error(`Failed to ingest index ${idx.symbol}:`, err.message);
    }
  }

  // Update freshness
  const nowIso = new Date().toISOString();
  await prisma.dataFreshness.upsert({
    where: { dataset: 'index_data' },
    create: {
      dataset: 'index_data',
      latestAsOf: nowIso,
      lastSuccessfulRun: nowIso,
      recordCount: INDICES.length,
      status: 'OK',
    },
    update: {
      latestAsOf: nowIso,
      lastSuccessfulRun: nowIso,
      recordCount: INDICES.length,
      status: 'OK',
    },
  });

  console.log('Index ingestion completed.');
}

if (process.argv[1]?.includes('ingestIndices')) {
  ingestIndices(true).catch(console.error);
}
