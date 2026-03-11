import fs from 'fs';
import path from 'path';
import type { Match } from './types';
import { MatchesSnapshotSchema } from './schemas';

const DATA_PATH = path.join(process.cwd(), 'data', 'normalized.json');

export function getMatches(): Match[] {
  if (!fs.existsSync(DATA_PATH)) {
    throw new Error('data/normalized.json not found. Run: npm run sync');
  }

  const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  const parsed = MatchesSnapshotSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(`Invalid snapshot shape: ${parsed.error.message}`);
  }

  return parsed.data;
}