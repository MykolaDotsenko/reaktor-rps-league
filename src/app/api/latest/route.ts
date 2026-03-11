import { NextResponse } from 'next/server';
import { getMatches } from '@/lib/data';
import { getLatestMatches } from '@/lib/queries';

export async function GET(req: Request) {
  try {
    const rawLimit = Number.parseInt(
      new URL(req.url).searchParams.get('limit') ?? '',
      10
    );
    const limit = Number.isNaN(rawLimit) ? 50 : rawLimit;

    return NextResponse.json(getLatestMatches(getMatches(), limit));
  } catch {
    return NextResponse.json(
      { error: 'Failed to load data' },
      { status: 500 }
    );
  }
}