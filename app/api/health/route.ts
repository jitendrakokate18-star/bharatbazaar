import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const startTime = Date.now();

export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  let dbHealthy = false;
  let totalCompanies = 0;
  let totalQuotes = 0;
  let latestQuoteTime = '';
  let dbError = '';

  try {
    totalCompanies = await prisma.company.count({
      where: { status: 'ACTIVE' },
    });

    totalQuotes = await prisma.priceLive.count();
    const latestQuote = await prisma.priceLive.aggregate({
      _max: { asOf: true },
    });
    latestQuoteTime = latestQuote._max.asOf || '';

    dbHealthy = totalCompanies > 0;
  } catch (err) {
    console.error('Health DB error:', err);
    dbHealthy = false;
    dbError = err instanceof Error ? err.message : String(err);
  }

  const responseBody = {
    status: dbHealthy ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    nodeVersion: process.version,
    database: {
      type: 'PostgreSQL (Neon)',
      healthy: dbHealthy,
      activeCompanies: totalCompanies,
      liveQuotesCached: totalQuotes,
      latestQuoteTime,
      error: dbError || undefined,
    },
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
  };

  return NextResponse.json(responseBody, {
    status: dbHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
