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

export type RawGameResult = z.infer<typeof GameResultSchema>;