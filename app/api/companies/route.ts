import { NextRequest, NextResponse } from 'next/server';
import { defaultDataProvider } from '@/lib/providers';
import { DirectoryFilters } from '@/lib/providers/dataProvider';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: DirectoryFilters = {
      search: searchParams.get('q') || undefined,
      exchange: (searchParams.get('exchange') as any) || 'ALL',
      sector: searchParams.get('sector') || undefined,
      marketCapCategory: (searchParams.get('marketCap') as any) || 'all',
      hasBrandsOnly: searchParams.get('hasBrands') === 'true',
      sortBy: (searchParams.get('sortBy') as any) || 'marketCapDesc',
      page: parseInt(searchParams.get('page') || '1', 10),
      pageSize: parseInt(searchParams.get('pageSize') || '50', 10),
    };

    const data = await defaultDataProvider.getAllCompanies(filters);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Error in /api/companies:', err);
    return NextResponse.json({
      companies: [],
      total: 0,
      error: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
