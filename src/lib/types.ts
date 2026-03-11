export type Move = 'ROCK' | 'PAPER' | 'SCISSORS';
export type PlayerOutcome = 'WIN' | 'LOSE' | 'TIE';

export interface Match {
  id: string;
  playedAtUtc: string;
  player1: string;
  player2: string;
  move1: Move;
  move2: Move;
  winner: string | null;
  isTie: boolean;
}

export interface LeaderboardEntry {
  player: string;
  wins: number;
}