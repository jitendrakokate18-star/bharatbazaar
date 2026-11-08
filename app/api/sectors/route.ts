import { NextResponse } from 'next/server';
import { dbService } from '@/lib/dbService';

export async function GET() {
  try {
    const sectors = dbService.getAllSectors();
    return NextResponse.json({ sectors });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
