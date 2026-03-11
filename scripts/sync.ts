import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import fs from 'fs';
import path from 'path';
import { fetchAllHistory } from '../src/lib/api-client';
import { normalizeAll } from '../src/lib/normalize';

async function main(): Promise<void> {
  const token = process.env.RPS_API_TOKEN;

  if (!token) {
    console.error('Set RPS_API_TOKEN in .env.local');
    process.exit(1);
  }

  console.log('=== RPS History Sync ===\n');
  const raw = await fetchAllHistory(token);

  console.log('\nNormalizing...');
  const { matches, stats } = normalizeAll(raw);

  console.log(
    `Total: ${stats.total} | Valid: ${stats.valid} | Invalid: ${stats.invalid} | Dupes: ${stats.duplicates}`
  );

  if (Object.keys(stats.reasons).length > 0) {
    console.log('Invalid reasons:', stats.reasons);
  }

  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(dir, 'normalized.json'),
    `${JSON.stringify(matches, null, 2)}\n`
  );

  fs.writeFileSync(
    path.join(dir, 'normalize-stats.json'),
    `${JSON.stringify(stats, null, 2)}\n`
  );

  console.log(`Saved ${matches.length} matches`);
}

main().catch((error) => {
  console.error('Sync failed:', error);
  process.exit(1);
});