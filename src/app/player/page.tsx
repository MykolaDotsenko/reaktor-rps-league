import { MatchTable } from '@/components/MatchTable';
import { PlayerSearchForm } from '@/components/PlayerSearchForm';
import { UtcNotice } from '@/components/UtcNotice';
import { EmptyState } from '@/components/EmptyState';
import { getMatches } from '@/lib/data';
import { getMatchesByPlayer } from '@/lib/queries';
import { isValidDate } from '@/lib/utc';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ name?: string; date?: string }>;
}

export default async function PlayerPage({ searchParams }: Props) {
  const params = await searchParams;

  const name = params.name?.trim() || '';
  const rawDate = params.date || '';
  const date = rawDate && isValidDate(rawDate) ? rawDate : '';
  const invalidDate = rawDate !== '' && !isValidDate(rawDate);

  const matches = name
    ? getMatchesByPlayer(getMatches(), name, date || undefined)
    : [];

  return (
    <div className="space-y-6">
      <UtcNotice />

      <div>
        <h1 className="text-2xl font-bold">Player Lookup</h1>
        <p className="mt-1 text-sm text-gray-500">
          Look up match history by exact player name
        </p>
      </div>

      <PlayerSearchForm initialName={name} initialDate={date} />

      {invalidDate && (
        <p className="text-sm text-red-400">Invalid date format. Use YYYY-MM-DD.</p>
      )}

      {name ? (
        <>
          <p className="text-sm text-gray-500">
            {matches.length} match{matches.length !== 1 ? 'es' : ''} found for
            {' '}&quot;{name}&quot;{date ? ` on ${date}` : ''}
          </p>

          {matches.length > 0 ? (
            <MatchTable matches={matches} highlightPlayer={name} />
          ) : (
            <EmptyState
              title="No matches found"
              description="Check the spelling — this is an exact name match. Try a name like &quot;Amara Chen&quot;."
            />
          )}
        </>
      ) : (
        <EmptyState
          title="Search for a player"
          description="Enter a full player name to browse their match history."
        />
      )}
    </div>
  );
}