import { describe, it, expect } from 'vitest';
import { getPlayerOutcome } from '../lib/queries';
import type { Match } from '../lib/types';

const base: Match = {
  id: '1',
  playedAtUtc: '2026-03-09T12:00:00.000Z',
  player1: 'Alice',
  player2: 'Bob',
  move1: 'ROCK',
  move2: 'SCISSORS',
  winner: 'Alice',
  isTie: false,
};

describe('getPlayerOutcome', () => {
  it('returns WIN for the winner', () => {
    expect(getPlayerOutcome(base, 'Alice')).toBe('WIN');
  });

  it('returns LOSE for the loser', () => {
    expect(getPlayerOutcome(base, 'Bob')).toBe('LOSE');
  });

  it('returns TIE for a tied match', () => {
    const tie: Match = {
      ...base,
      move2: 'ROCK',
      winner: null,
      isTie: true,
    };
    expect(getPlayerOutcome(tie, 'Alice')).toBe('TIE');
  });

  it('returns TIE for self-play match', () => {
    const self: Match = {
      ...base,
      player1: 'Alice',
      player2: 'Alice',
      winner: null,
      isTie: true,
    };
    expect(getPlayerOutcome(self, 'Alice')).toBe('TIE');
  });

  it('throws for player not in match', () => {
    expect(() => getPlayerOutcome(base, 'Charlie')).toThrow(/Charlie/);
  });
});
