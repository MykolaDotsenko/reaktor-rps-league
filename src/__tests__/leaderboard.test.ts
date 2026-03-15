import { describe, it, expect } from 'vitest';
import { buildLeaderboard, getMatchesByDay } from '../lib/queries';
import type { Match } from '../lib/types';

function makeMatch(
  id: string,
  time: string,
  p1: string,
  p2: string,
  winner: string | null
): Match {
  let move1: 'ROCK' | 'PAPER' | 'SCISSORS' = 'ROCK';
  let move2: 'ROCK' | 'PAPER' | 'SCISSORS' = 'ROCK';

  if (winner === p1) {
    move1 = 'ROCK';
    move2 = 'SCISSORS';
  } else if (winner === p2) {
    move1 = 'SCISSORS';
    move2 = 'ROCK';
  }

  return {
    id,
    playedAtUtc: time,
    player1: p1,
    player2: p2,
    move1,
    move2,
    winner,
    isTie: winner === null,
  };
}

describe('buildLeaderboard', () => {
  const from = '2026-03-01T00:00:00.000Z';
  const to = '2026-03-10T00:00:00.000Z';

  it('counts wins correctly', () => {
    const matches = [
      makeMatch('1', '2026-03-02T10:00:00.000Z', 'Alice', 'Bob', 'Alice'),
      makeMatch('2', '2026-03-02T11:00:00.000Z', 'Alice', 'Bob', 'Alice'),
      makeMatch('3', '2026-03-02T12:00:00.000Z', 'Bob', 'Alice', 'Bob'),
    ];
    const board = buildLeaderboard(matches, from, to);
    expect(board[0]).toEqual({ player: 'Alice', wins: 2 });
    expect(board[1]).toEqual({ player: 'Bob', wins: 1 });
  });

  it('excludes ties from leaderboard', () => {
    const matches = [
      makeMatch('1', '2026-03-02T10:00:00.000Z', 'Alice', 'Bob', null),
    ];
    const board = buildLeaderboard(matches, from, to);
    expect(board).toHaveLength(0);
  });

  it('excludes matches outside date range', () => {
    const matches = [
      makeMatch('1', '2026-02-28T10:00:00.000Z', 'Alice', 'Bob', 'Alice'),
    ];
    const board = buildLeaderboard(matches, from, to);
    expect(board).toHaveLength(0);
  });

  it('sorts by wins desc then name A-Z on tie', () => {
    const matches = [
      makeMatch('1', '2026-03-02T10:00:00.000Z', 'Zara', 'Bob', 'Zara'),
      makeMatch('2', '2026-03-02T11:00:00.000Z', 'Alice', 'Bob', 'Alice'),
    ];
    const board = buildLeaderboard(matches, from, to);
    expect(board[0].player).toBe('Alice');
    expect(board[1].player).toBe('Zara');
  });

  it('does not count self-play (winner is null after normalization)', () => {
    const selfPlay: Match = {
      id: 'self',
      playedAtUtc: '2026-03-02T10:00:00.000Z',
      player1: 'X',
      player2: 'X',
      move1: 'ROCK',
      move2: 'SCISSORS',
      winner: null,
      isTie: true,
    };
    const board = buildLeaderboard([selfPlay], from, to);
    expect(board).toHaveLength(0);
  });
});

describe('getMatchesByDay', () => {
  const matches: Match[] = [
    makeMatch('d1', '2026-03-09T00:00:00.000Z', 'A', 'B', 'A'),
    makeMatch('d2', '2026-03-09T23:59:59.999Z', 'A', 'B', 'A'),
    makeMatch('d3', '2026-03-10T00:00:00.000Z', 'A', 'B', 'A'),
  ];

  it('includes full day and excludes next day start', () => {
    const result = getMatchesByDay(matches, '2026-03-09');
    expect(result).toHaveLength(2);
  });

  it('returns empty for day with no matches', () => {
    expect(getMatchesByDay(matches, '2026-03-11')).toHaveLength(0);
  });
});