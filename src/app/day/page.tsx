import { MatchTable } from '@/components/MatchTable';
import { DayFilterForm } from '@/components/DayFilterForm';
import { UtcNotice } from '@/components/UtcNotice';
import { EmptyState } from '@/components/EmptyState';
import { getMatches } from '@/lib/data';
import { getMatchesByDay } from '@/lib/queries';
import { isValidDate } from '@/lib/utc';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ date?: string }>;
}

export default async function DayPage({ searchParams }: Props) {
  const params = await searchParams;
  const allMatches = getMatches();
  const latestAvailableDay = allMatches.at(-1)?.playedAtUtc.slice(0, 10) ?? '2026-03-09';

  const rawDate = params.date || '';
  const date = rawDate || latestAvailableDay;
  const valid = isValidDate(date);
  const matches = valid ? getMatchesByDay(allMatches, date) : [];

  return (
    <div className="space-y-6">
      <UtcNotice />
      <div>
        <h1 className="text-2xl font-bold">Matches by Day</h1>
        <p className="mt-1 text-sm text-gray-500">Browse all valid matches for a single UTC date</p>
      </div>
      <DayFilterForm initialDate={valid ? date : ''} />
      {!valid && rawDate && (
        <p className="text-sm text-red-400">Invalid date format. Use YYYY-MM-DD.</p>
      )}
      {valid && (
        <>
          <p className="text-sm text-gray-500">
            {matches.length} match{matches.length !== 1 ? 'es' : ''} on {date} (UTC)
          </p>
          {matches.length > 0 ? (
            <MatchTable matches={matches} />
          ) : (
            <EmptyState title="No matches found" description="There are no valid matches for this UTC date." />
          )}
        </>
      )}
    </div>
  );
}