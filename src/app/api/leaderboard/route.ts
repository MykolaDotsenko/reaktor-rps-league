import { NextResponse } from 'next/server';
import { getMatches } from '@/lib/data';
import { buildLeaderboard } from '@/lib/queries';
import { getTodayUtc, getUtcDayRange, isValidDate } from '@/lib/utc';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    if (url.searchParams.get('today') === 'true') {
      const { start, end } = getUtcDayRange(getTodayUtc());
      return NextResponse.json(buildLeaderboard(getMatches(), start, end));
    }

    const from = url.searchParams.get('from') || '';
    const to = url.searchParams.get('to') || '';

    if (!isValidDate(from) || !isValidDate(to)) {
      return NextResponse.json(
        { error: 'Valid from/to required, or today=true' },
        { status: 400 }
      );
    }

    if (from > to) {
      return NextResponse.json(
        { error: 'from must be <= to' },
        { status: 400 }
      );
    }

    const startUtc = `${from}T00:00:00.000Z`;
    const endDate = new Date(`${to}T00:00:00.000Z`);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    return NextResponse.json(
      buildLeaderboard(getMatches(), startUtc, endDate.toISOString())
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to load data' },
      { status: 500 }
    );
  }
}