import { NextResponse } from 'next/server';
import { dbService } from '@/lib/dbService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sectors = await dbService.getAllSectors();
    return NextResponse.json({ sectors });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
