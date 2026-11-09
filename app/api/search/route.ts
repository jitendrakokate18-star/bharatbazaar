import { NextRequest, NextResponse } from 'next/server';
import { defaultDataProvider } from '@/lib/providers';
import { Locale } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const lang = (searchParams.get('lang') || 'en') as Locale;

    const results = await defaultDataProvider.search(q, lang);
    return NextResponse.json({ results });
  } catch (err: any) {
    console.error('Error in /api/search:', err);
    return NextResponse.json({ results: [] });
  }
}
