import { describe, it, expect } from 'vitest';
import { resolveWinner } from '../lib/winner';
import type { Move } from '../lib/types';

describe('resolveWinner', () => {
  it('ROCK beats SCISSORS', () => {
    expect(resolveWinner('A', 'ROCK', 'B', 'SCISSORS'))
      .toEqual({ winner: 'A', isTie: false });
  });

  it('SCISSORS beats PAPER', () => {
    expect(resolveWinner('A', 'SCISSORS', 'B', 'PAPER'))
      .toEqual({ winner: 'A', isTie: false });
  });

  it('PAPER beats ROCK', () => {
    expect(resolveWinner('A', 'PAPER', 'B', 'ROCK'))
      .toEqual({ winner: 'A', isTie: false });
  });

  it('SCISSORS loses to ROCK', () => {
    expect(resolveWinner('A', 'SCISSORS', 'B', 'ROCK'))
      .toEqual({ winner: 'B', isTie: false });
  });

  it('PAPER loses to SCISSORS', () => {
    expect(resolveWinner('A', 'PAPER', 'B', 'SCISSORS'))
      .toEqual({ winner: 'B', isTie: false });
  });

  it('ROCK loses to PAPER', () => {
    expect(resolveWinner('A', 'ROCK', 'B', 'PAPER'))
      .toEqual({ winner: 'B', isTie: false });
  });

  it.each<Move>(['ROCK', 'PAPER', 'SCISSORS'])(
    'TIE when both play %s',
    (move) => {
      expect(resolveWinner('A', move, 'B', move))
        .toEqual({ winner: null, isTie: true });
    }
  );
});