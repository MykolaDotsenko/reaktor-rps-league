import type { Match, LeaderboardEntry, PlayerOutcome } from './types';
import { getUtcDayRange, isInRange } from './utc';

function sortByPlayedAtDesc(a: Match, b: Match): number {
  return (
    b.playedAtUtc.localeCompare(a.playedAtUtc) || b.id.localeCompare(a.id)
  );
}

export function getLatestMatches(matches: Match[], limit = 50): Match[] {
  const safeLimit = Math.min(Math.max(limit, 1), 200);

  return [...matches].sort(sortByPlayedAtDesc).slice(0, safeLimit);
}

export function getMatchesByDay(matches: Match[], date: string): Match[] {
  const { start, end } = getUtcDayRange(date);

  return matches
    .filter((m) => isInRange(m.playedAtUtc, start, end))
    .sort(sortByPlayedAtDesc);
}

export function getMatchesByPlayer(
  matches: Match[],
  name: string,
  date?: string
): Match[] {
  const normalizedName = name.trim();

  let result = matches.filter(
    (m) => m.player1 === normalizedName || m.player2 === normalizedName
  );

  if (date) {
    const { start, end } = getUtcDayRange(date);
    result = result.filter((m) => isInRange(m.playedAtUtc, start, end));
  }

  return result.sort(sortByPlayedAtDesc);
}

export function getPlayerOutcome(m: Match, name: string): PlayerOutcome {
  const normalizedName = name.trim();

  if (m.player1 !== normalizedName && m.player2 !== normalizedName) {
    throw new Error(`Player "${normalizedName}" not in match ${m.id}`);
  }

  if (m.player1 === normalizedName && m.player2 === normalizedName) {
    if (m.isTie) return 'TIE';

    throw new Error(
      `Ambiguous same-name non-tie match for "${normalizedName}" in ${m.id}`
    );
  }

  if (m.isTie) return 'TIE';
  return m.winner === normalizedName ? 'WIN' : 'LOSE';
}

export function buildLeaderboard(
  matches: Match[],
  from: string,
  to: string
): LeaderboardEntry[] {
  const wins = new Map<string, number>();

  for (const m of matches) {
    if (!m.winner || !isInRange(m.playedAtUtc, from, to)) continue;
    wins.set(m.winner, (wins.get(m.winner) ?? 0) + 1);
  }

  return Array.from(wins.entries())
    .map(([player, wins]) => ({ player, wins }))
    .sort((a, b) => b.wins - a.wins || a.player.localeCompare(b.player));
}