import { MatchTable } from '@/components/MatchTable';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { UtcNotice } from '@/components/UtcNotice';
import { EmptyState } from '@/components/EmptyState';
import { getMatches } from '@/lib/data';
import { getLatestMatches, buildLeaderboard } from '@/lib/queries';
import { getUtcDayRange, getTodayUtc } from '@/lib/utc';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const matches = getMatches();
  const latestMatches = getLatestMatches(matches, 50);

  const today = getTodayUtc();
  const latestAvailableDay = matches.at(-1)?.playedAtUtc.slice(0, 10) ?? today;

  const todayRange = getUtcDayRange(today);
  const todayBoard = buildLeaderboard(matches, todayRange.start, todayRange.end).slice(0, 20);

  const fallbackRange = getUtcDayRange(latestAvailableDay);
  const latestAvailableBoard = buildLeaderboard(
    matches, fallbackRange.start, fallbackRange.end
  ).slice(0, 20);

  const showTodayBoard = todayBoard.length > 0;
  const boardTitle = showTodayBoard ? `Today's Leaderboard` : 'Latest Available Day Leaderboard';
  const boardSubtitle = showTodayBoard
    ? `${today} (UTC) · Top 20 by wins`
    : `${latestAvailableDay} (UTC) · Top 20 by wins`;

  return (
    <div className="space-y-10">
      <UtcNotice />

      <section className="space-y-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold">Latest Matches</h1>
          <p className="text-sm text-gray-500">Most recent 50 valid matches from the normalized snapshot</p>
        </div>
        {latestMatches.length > 0 ? (
          <MatchTable matches={latestMatches} />
        ) : (
          <EmptyState title="No matches available" description="The synchronized snapshot does not contain any valid matches." />
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="mb-1 text-2xl font-bold">{boardTitle}</h2>
          <p className="text-sm text-gray-500">{boardSubtitle}</p>
        </div>
        {!showTodayBoard && latestAvailableDay !== today && (
          <div className="rounded-lg border border-amber-800/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-300">
            No matches were found for the current UTC day in the synchronized snapshot, so the page shows the latest available day instead.
          </div>
        )}
        {(showTodayBoard ? todayBoard : latestAvailableBoard).length > 0 ? (
          <LeaderboardTable entries={showTodayBoard ? todayBoard : latestAvailableBoard} />
        ) : (
          <EmptyState title="No leaderboard data" description="No wins were found for the selected snapshot day." />
        )}
      </section>
    </div>
  );
}