import { getMatches } from '../src/lib/data';
import {
  buildLeaderboard,
  getMatchesByDay,
  getMatchesByPlayer,
  getPlayerOutcome,
} from '../src/lib/queries';

function main(): void {
  const data = getMatches();
  console.log(`Loaded ${data.length} matches\n`);

  // Q1: Who won the last match on March 9th?
  const mar9 = getMatchesByDay(data, '2026-03-09');
  const last = mar9[0];

  console.log('Q1: Last match winner on March 9');
  console.log(last ? `  ${last.winner ?? 'TIE'}` : '  No data');

  // Q2: First 10 results for Amara Chen on Feb 28
  const targetName = 'Amara Chen';
  const targetMatches = getMatchesByPlayer(data, targetName, '2026-02-28');
  const firstTenChronological = [...targetMatches].reverse().slice(0, 10);

  let results: Array<'WIN' | 'LOSE' | 'TIE'>;
  try {
    results = firstTenChronological.map((m) =>
      getPlayerOutcome(m, targetName)
    );
  } catch (error) {
    throw new Error(
      `Q2 could not be computed unambiguously for ${targetName}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  console.log(`\nQ2: First 10 for ${targetName} on Feb 28`);
  console.log(`  ${results.join(', ')}`);

  // Q3: Top 10 players until end of March 8
  const earliest = data[0]?.playedAtUtc ?? '';
  const board = buildLeaderboard(
    data,
    earliest,
    '2026-03-09T00:00:00.000Z'
  ).slice(0, 10);

  console.log('\nQ3: Top 10 until end of March 8');
  board.forEach((entry, index) => {
    console.log(`  ${index + 1}. ${entry.player} — ${entry.wins}`);
  });
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}