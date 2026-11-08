import { NextRequest, NextResponse } from 'next/server';
import { defaultDataProvider } from '@/lib/providers';
import { Locale } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const lang = (searchParams.get('lang') || 'en') as Locale;

  const results = await defaultDataProvider.search(q, lang);
  return NextResponse.json({ results });
}
