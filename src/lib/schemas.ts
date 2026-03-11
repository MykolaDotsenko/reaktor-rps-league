import { z } from 'zod';

const MoveSchema = z.enum(['ROCK', 'PAPER', 'SCISSORS']);

const PlayerSchema = z.object({
  name: z.string().trim().min(1),
  played: MoveSchema,
});

export const GameResultSchema = z.object({
  type: z.literal('GAME_RESULT'),
  gameId: z.string().trim().min(1),
  time: z.number().int().nonnegative(),
  playerA: PlayerSchema,
  playerB: PlayerSchema,
});

export const HistoryPageSchema = z.object({
  data: z.array(z.unknown()),
  cursor: z.string().trim().min(1).nullable().optional(),
});

export const MatchSchema = z.object({
  id: z.string().trim().min(1),
  playedAtUtc: z.string().min(1),
  player1: z.string().trim().min(1),
  player2: z.string().trim().min(1),
  move1: MoveSchema,
  move2: MoveSchema,
  winner: z.string().trim().min(1).nullable(),
  isTie: z.boolean(),
});

export const MatchesSnapshotSchema = z.array(MatchSchema);

export type RawGameResult = z.infer<typeof GameResultSchema>;