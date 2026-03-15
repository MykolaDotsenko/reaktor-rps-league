import { describe, it, expect } from 'vitest';
import { normalizeRecord, normalizeAll } from '../lib/normalize';
import { GameResultSchema } from '../lib/schemas';

const VALID_RAW = {
  type: 'GAME_RESULT' as const,
  gameId: 'abc123',
  time: 1773066868000,
  playerA: { name: 'Alice', played: 'ROCK' as const },
  playerB: { name: 'Bob', played: 'SCISSORS' as const },
};

describe('normalizeRecord', () => {
  it('normalizes a valid record into a Match', () => {
    const m = normalizeRecord(VALID_RAW);
    expect(m).not.toBeNull();
    expect(m!.id).toBe('abc123');
    expect(m!.player1).toBe('Alice');
    expect(m!.player2).toBe('Bob');
    expect(m!.move1).toBe('ROCK');
    expect(m!.move2).toBe('SCISSORS');
    expect(m!.winner).toBe('Alice');
    expect(m!.isTie).toBe(false);
    expect(m!.playedAtUtc).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('returns null for invalid move (DOG)', () => {
    const bad = {
      ...VALID_RAW,
      gameId: 'dog1',
      playerA: { name: 'X', played: 'DOG' },
    };
    expect(normalizeRecord(bad)).toBeNull();
  });

    it('returns null for missing gameId', () => {
    const { type, time, playerA, playerB } = VALID_RAW;
    expect(normalizeRecord({ type, time, playerA, playerB })).toBeNull();
    });

  it('returns null for empty player name', () => {
    const bad = {
      ...VALID_RAW,
      gameId: 'empty1',
      playerA: { name: '', played: 'ROCK' as const },
    };
    expect(normalizeRecord(bad)).toBeNull();
  });

  it('returns null for time = 0', () => {
    const schemaResult = GameResultSchema.safeParse({ ...VALID_RAW, time: 0 });
    expect(schemaResult.success).toBe(false);

    const bad = { ...VALID_RAW, gameId: 'zero1', time: 0 };
    expect(normalizeRecord(bad)).toBeNull();
  });

  it('returns null for wrong type field', () => {
    const bad = { ...VALID_RAW, gameId: 'type1', type: 'GAME_BEGIN' };
    expect(normalizeRecord(bad)).toBeNull();
  });

  it('forces self-play to tie even with different moves', () => {
    const self = {
      ...VALID_RAW,
      gameId: 'self1',
      playerA: { name: 'Mateo Müller', played: 'ROCK' as const },
      playerB: { name: 'Mateo Müller', played: 'SCISSORS' as const },
    };
    const m = normalizeRecord(self);
    expect(m).not.toBeNull();
    expect(m!.winner).toBeNull();
    expect(m!.isTie).toBe(true);
    expect(m!.player1).toBe('Mateo Müller');
    expect(m!.player2).toBe('Mateo Müller');
  });

  it('forces self-play to tie with same moves', () => {
    const self = {
      ...VALID_RAW,
      gameId: 'self2',
      playerA: { name: 'Omar Tanaka', played: 'PAPER' as const },
      playerB: { name: 'Omar Tanaka', played: 'PAPER' as const },
    };
    const m = normalizeRecord(self);
    expect(m).not.toBeNull();
    expect(m!.winner).toBeNull();
    expect(m!.isTie).toBe(true);
  });
});

describe('normalizeAll', () => {
  it('deduplicates records by gameId', () => {
    const { matches, stats } = normalizeAll([VALID_RAW, VALID_RAW]);
    expect(matches).toHaveLength(1);
    expect(stats.duplicates).toBe(1);
    expect(stats.valid).toBe(1);
  });

  it('counts invalid records and tracks reasons', () => {
    const invalid = {
      ...VALID_RAW,
      gameId: 'inv1',
      playerA: { name: 'A', played: 'DOG' },
    };
    const { stats } = normalizeAll([VALID_RAW, invalid]);
    expect(stats.valid).toBe(1);
    expect(stats.invalid).toBe(1);
    const totalReasons = Object.values(stats.reasons).reduce((a, b) => a + b, 0);
    expect(totalReasons).toBe(1);
    const reasonKey = Object.keys(stats.reasons)[0];
    expect(reasonKey).toBeDefined();
  });

  it('sorts matches chronologically by playedAtUtc', () => {
    const earlier = { ...VALID_RAW, gameId: 'early', time: 1000000000000 };
    const later = { ...VALID_RAW, gameId: 'late', time: 2000000000000 };
    const { matches } = normalizeAll([later, earlier]);
    expect(matches[0].id).toBe('early');
    expect(matches[1].id).toBe('late');
  });

  it('counts self-play matches', () => {
    const selfPlay = {
      ...VALID_RAW,
      gameId: 'selfcount',
      playerA: { name: 'X', played: 'ROCK' as const },
      playerB: { name: 'X', played: 'PAPER' as const },
    };
    const { matches, stats } = normalizeAll([VALID_RAW, selfPlay]);
    expect(stats.valid).toBe(2);
    expect(stats.selfPlays).toBe(1);
    const selfMatch = matches.find((m) => m.id === 'selfcount');
    expect(selfMatch).toBeDefined();
    expect(selfMatch!.winner).toBeNull();
    expect(selfMatch!.isTie).toBe(true);
  });
});