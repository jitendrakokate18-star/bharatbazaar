import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMarketStatus } from '@/lib/dates';

export const dynamic = 'force-dynamic';

export async function GET() {
  // 1. Company Master stats
  const totalComp = await prisma.company.count();
  const dualComp = await prisma.company.count({
    where: { nseSymbol: { not: null }, bseCode: { not: null } },
  });
  const nseOnlyComp = await prisma.company.count({
    where: { nseSymbol: { not: null }, bseCode: null },
  });
  const bseOnlyComp = await prisma.company.count({
    where: { nseSymbol: null, bseCode: { not: null } },
  });

  // 2. Price stats
  const livePricesCount = await prisma.priceLive.count();
  const latestLiveQuote = (await prisma.priceLive.aggregate({ _max: { quoteTime: true } }))._max.quoteTime;

  const historyRowsCount = await prisma.priceHistory.count();
  const latestHistoryDate = (await prisma.priceHistory.aggregate({ _max: { date: true } }))._max.date;

  // 3. Index stats
  const indexQuotesCount = await prisma.indexQuote.count();
  const latestIndexHistoryDate = (await prisma.indexHistory.aggregate({ _max: { date: true } }))._max.date;

  // 4. Financials stats
  const annualFinCount = await prisma.financialsAnnual.count();
  const quarterlyFinCount = await prisma.financialsQuarterly.count();
  const annualByFy: any[] = await prisma.$queryRawUnsafe('SELECT fiscal_year, COUNT(*)::int as count FROM financials_annual GROUP BY fiscal_year ORDER BY fiscal_year DESC');
  const quarterlyByQ: any[] = await prisma.$queryRawUnsafe('SELECT quarter_label, COUNT(*)::int as count FROM financials_quarterly GROUP BY quarter_label, period_end_date ORDER BY period_end_date DESC LIMIT 8');

  // 5. Shareholding & Corporate Actions
  const shareholdingCount = await prisma.shareholding.count();
  const corpActionsCount = await prisma.corporateAction.count();
  const dividendsCount = await prisma.corporateAction.count({ where: { type: 'DIVIDEND' } });
  const splitsCount = await prisma.corporateAction.count({ where: { type: { in: ['SPLIT', 'BONUS'] } } });

  // 6. Data Freshness table
  const freshnessRows = await prisma.dataFreshness.findMany();

  // 7. Holidays
  const holidaysCount = await prisma.marketHoliday.count();

  return NextResponse.json({
    status: 'HEALTHY',
    systemDate: new Date().toISOString().split('T')[0],
    marketStatus: getMarketStatus(),
    dataProviderMode: process.env.DATA_PROVIDER === 'mock' ? 'MOCK' : 'REAL (Free Delayed Feeds)',
    companyMaster: {
      total: totalComp,
      dualListed: dualComp,
      nseOnly: nseOnlyComp,
      bseOnly: bseOnlyComp,
    },
    livePrices: {
      count: livePricesCount,
      latestQuoteTime: latestLiveQuote,
    },
    priceHistory: {
      totalRows: historyRowsCount,
      latestCloseDate: latestHistoryDate,
    },
    indices: {
      count: indexQuotesCount,
      latestCloseDate: latestIndexHistoryDate,
    },
    financials: {
      annualCount: annualFinCount,
      quarterlyCount: quarterlyFinCount,
      byFiscalYear: annualByFy,
      byQuarter: quarterlyByQ,
    },
    shareholding: {
      count: shareholdingCount,
    },
    corporateActions: {
      total: corpActionsCount,
      dividends: dividendsCount,
      splitsAndBonus: splitsCount,
    },
    holidaysCount,
    freshness: freshnessRows,
  });
}
