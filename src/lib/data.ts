import fs from 'fs';
import path from 'path';
import type { Match } from './types';
import { MatchesSnapshotSchema } from './schemas';

const DATA_PATH = path.join(process.cwd(), 'data', 'normalized.json');

let cached: Match[] | null = null;

export function getMatches(): Match[] {
  if (cached) return cached;

  if (!fs.existsSync(DATA_PATH)) {
    throw new Error('data/normalized.json not found. Run: npm run sync');
  }

  const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  const parsed = MatchesSnapshotSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(`Invalid snapshot shape: ${parsed.error.message}`);
  }

  cached = parsed.data;
  return cached;
}

/** Call after re-sync to force reload on next getMatches() */
export function clearMatchCache(): void {
  cached = null;
}