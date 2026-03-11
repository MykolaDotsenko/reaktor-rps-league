import { NextResponse } from 'next/server';
import { getMatches } from '@/lib/data';
import { getMatchesByDay } from '@/lib/queries';
import { isValidDate } from '@/lib/utc';

export async function GET(req: Request) {
  try {
    const date = new URL(req.url).searchParams.get('date') || '';

    if (!isValidDate(date)) {
      return NextResponse.json(
        { error: 'Invalid date (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    return NextResponse.json(getMatchesByDay(getMatches(), date));
  } catch {
    return NextResponse.json(
      { error: 'Failed to load data' },
      { status: 500 }
    );
  }
}