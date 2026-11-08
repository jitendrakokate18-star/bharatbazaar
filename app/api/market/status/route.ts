import { NextResponse } from 'next/server';
import { getMarketStatus } from '@/lib/dates';

export async function GET() {
  const status = getMarketStatus();
  return NextResponse.json(status);
}
