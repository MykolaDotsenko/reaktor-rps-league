import { NextResponse } from 'next/server';
import { getMatches } from '@/lib/data';
import { getMatchesByPlayer } from '@/lib/queries';
import { isValidDate } from '@/lib/utc';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const name = url.searchParams.get('name')?.trim();

    if (!name) {
      return NextResponse.json(
        { error: 'name required' },
        { status: 400 }
      );
    }

    const date = url.searchParams.get('date') || undefined;
    if (date && !isValidDate(date)) {
      return NextResponse.json(
        { error: 'Invalid date' },
        { status: 400 }
      );
    }

    return NextResponse.json(getMatchesByPlayer(getMatches(), name, date));
  } catch {
    return NextResponse.json(
      { error: 'Failed to load data' },
      { status: 500 }
    );
  }
}