import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

const startTime = Date.now();

export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  let dbHealthy = false;
  let totalCompanies = 0;
  let totalQuotes = 0;
  let latestQuoteTime = '';

  try {
    const db = getDb();
    const compRow = db.prepare("SELECT count(*) as count FROM company WHERE status = 'ACTIVE'").get() as any;
    totalCompanies = compRow ? compRow.count : 0;

    const quoteRow = db.prepare("SELECT count(*) as count, max(as_of) as latest FROM price_live").get() as any;
    totalQuotes = quoteRow ? quoteRow.count : 0;
    latestQuoteTime = quoteRow ? quoteRow.latest : '';

    dbHealthy = totalCompanies > 0;
  } catch (err) {
    console.error('Health DB error:', err);
    dbHealthy = false;
  }

  const responseBody = {
    status: dbHealthy ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    database: {
      healthy: dbHealthy,
      activeCompanies: totalCompanies,
      liveQuotesCached: totalQuotes,
      latestQuoteTime,
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
