import { LeaderboardTable } from '@/components/LeaderboardTable';
import { DateRangeForm } from '@/components/DateRangeForm';
import { UtcNotice } from '@/components/UtcNotice';
import { EmptyState } from '@/components/EmptyState';
import { getMatches } from '@/lib/data';
import { buildLeaderboard } from '@/lib/queries';
import { getUtcDayRange, isValidDate } from '@/lib/utc';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ from?: string; to?: string }>;
}

function shiftUtcDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default async function LeaderboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const matches = getMatches();

  const latestAvailableDay = matches.at(-1)?.playedAtUtc.slice(0, 10) ?? '2026-03-09';
  const defaultTo = latestAvailableDay;
  const defaultFrom = shiftUtcDate(defaultTo, -6);

  const from = params.from || defaultFrom;
  const to = params.to || defaultTo;
  const valid = isValidDate(from) && isValidDate(to) && from <= to;

  let entries: { player: string; wins: number }[] = [];
  if (valid) {
    const startUtc = `${from}T00:00:00.000Z`;
    const { end: endUtc } = getUtcDayRange(to);
    entries = buildLeaderboard(matches, startUtc, endUtc).slice(0, 100);
  }

  return (
    <div className="space-y-6">
      <UtcNotice />
      <div>
        <h1 className="text-2xl font-bold">Historical Leaderboard</h1>
        <p className="mt-1 text-sm text-gray-500">Rank players by wins across any UTC date range</p>
      </div>
      <DateRangeForm initialFrom={from} initialTo={to} />
      {from && to && !valid && (
        <p className="text-sm text-red-400">
          Invalid date range. Use YYYY-MM-DD and ensure &quot;from&quot; ≤ &quot;to&quot;.
        </p>
      )}
      {valid && (
        <>
          <p className="text-sm text-gray-500">
            Top {entries.length} players from {from} to {to} (UTC) by wins
          </p>
          {entries.length > 0 ? (
            <LeaderboardTable entries={entries} />
          ) : (
            <EmptyState title="No leaderboard entries" description="No wins were found in this UTC date range." />
          )}
        </>
      )}
    </div>
  );
}