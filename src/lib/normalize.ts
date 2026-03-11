import type { Match } from './types';
import { resolveWinner } from './winner';
import { GameResultSchema } from './schemas';

export interface SyncStats {
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
  reasons: Record<string, number>;
}

function classifyInvalidReason(raw: unknown): string {
  const parsed = GameResultSchema.safeParse(raw);
  if (parsed.success) return 'UNKNOWN';

  const firstIssue = parsed.error.issues[0];
  if (!firstIssue) return 'UNKNOWN';

  const path = firstIssue.path.join('.');

  if (path.includes('time')) return 'BAD_TIMESTAMP';
  if (path.includes('played')) return 'INVALID_MOVE';
  if (path.includes('name')) return 'MISSING_PLAYER';
  if (path.includes('gameId')) return 'MISSING_GAME_ID';
  if (path.includes('type')) return 'BAD_TYPE';

  return 'MALFORMED_RECORD';
}

export function normalizeRecord(raw: unknown): Match | null {
  const parsed = GameResultSchema.safeParse(raw);
  if (!parsed.success) return null;

  const r = parsed.data;
  const { winner, isTie } = resolveWinner(
    r.playerA.name,
    r.playerA.played,
    r.playerB.name,
    r.playerB.played
  );

  return {
    id: r.gameId,
    playedAtUtc: new Date(r.time).toISOString(),
    player1: r.playerA.name,
    player2: r.playerB.name,
    move1: r.playerA.played,
    move2: r.playerB.played,
    winner,
    isTie,
  };
}

export function normalizeAll(rawRecords: unknown[]): {
  matches: Match[];
  stats: SyncStats;
} {
  const stats: SyncStats = {
    total: rawRecords.length,
    valid: 0,
    invalid: 0,
    duplicates: 0,
    reasons: {},
  };

  const matches: Match[] = [];
  const seen = new Set<string>();

  for (const raw of rawRecords) {
    const match = normalizeRecord(raw);

    if (!match) {
      stats.invalid++;
      const reason = classifyInvalidReason(raw);
      stats.reasons[reason] = (stats.reasons[reason] ?? 0) + 1;
      continue;
    }

    if (seen.has(match.id)) {
      stats.duplicates++;
      continue;
    }

    seen.add(match.id);
    matches.push(match);
    stats.valid++;
  }

  matches.sort(
    (a, b) =>
      a.playedAtUtc.localeCompare(b.playedAtUtc) ||
      a.id.localeCompare(b.id)
  );

  return { matches, stats };
}