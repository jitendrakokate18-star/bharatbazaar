import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '@/lib/dbService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const data = dbService.getSectorBySlug(slug);
    if (!data.sector) {
      return NextResponse.json({ error: 'Sector not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
