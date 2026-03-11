import type { Move } from './types';

const BEATS: Record<Move, Move> = {
  ROCK: 'SCISSORS',
  PAPER: 'ROCK',
  SCISSORS: 'PAPER',
};

export function resolveWinner(
  p1: string,
  m1: Move,
  p2: string,
  m2: Move
): { winner: string | null; isTie: boolean } {
  if (m1 === m2) {
    return { winner: null, isTie: true };
  }

  return BEATS[m1] === m2
    ? { winner: p1, isTie: false }
    : { winner: p2, isTie: false };
}