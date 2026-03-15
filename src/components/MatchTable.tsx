import type { Match } from '@/lib/types';

const MOVE_EMOJI: Record<string, string> = {
  ROCK: '✊',
  PAPER: '📄',
  SCISSORS: '✂️',
};

function OutcomeBadge({ outcome }: { outcome: 'WIN' | 'LOSE' | 'TIE' }) {
  const styles = {
    WIN: 'border-green-700/50 bg-green-900/60 text-green-300',
    LOSE: 'border-red-700/50 bg-red-900/60 text-red-300',
    TIE: 'border-gray-700/50 bg-gray-800/60 text-gray-400',
  };
  return (
    <span className={`rounded border px-2 py-0.5 text-xs font-medium ${styles[outcome]}`}>
      {outcome}
    </span>
  );
}

function getExactOutcome(
  m: Match,
  playerName?: string
): 'WIN' | 'LOSE' | 'TIE' | null {
  if (!playerName) return null;
  const normalized = playerName.trim();
  const isP1 = m.player1 === normalized;
  const isP2 = m.player2 === normalized;
  if (!isP1 && !isP2) return null;
  if (m.isTie) return 'TIE';
  if (isP1 && m.winner === m.player1) return 'WIN';
  if (isP2 && m.winner === m.player2) return 'WIN';
  return 'LOSE';
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

interface Props {
  matches: Match[];
  highlightPlayer?: string;
}

export function MatchTable({ matches, highlightPlayer }: Props) {
  if (matches.length === 0) return null;
  const showOutcomeColumn = Boolean(highlightPlayer?.trim());

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-900/80 text-xs uppercase tracking-wider text-gray-400">
            <th className="px-4 py-3 text-left">Time (UTC)</th>
            <th className="px-4 py-3 text-left">Player A</th>
            <th className="px-4 py-3 text-center">vs</th>
            <th className="px-4 py-3 text-left">Player B</th>
            <th className="px-4 py-3 text-left">Result</th>
            {showOutcomeColumn && <th className="px-4 py-3 text-center">Outcome</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {matches.map((m) => {
            const outcome = getExactOutcome(m, highlightPlayer);
            return (
              <tr key={m.id} className="transition-colors hover:bg-gray-900/40">
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-gray-500">
                  {formatTime(m.playedAtUtc)}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5">
                  <span className={m.winner === m.player1 ? 'font-medium text-green-400' : 'text-gray-300'}>
                    {m.player1}
                  </span>
                  <span className="ml-2 text-xs">{MOVE_EMOJI[m.move1] || m.move1}</span>
                </td>
                <td className="px-4 py-2.5 text-center text-xs text-gray-600">vs</td>
                <td className="whitespace-nowrap px-4 py-2.5">
                  <span className={m.winner === m.player2 ? 'font-medium text-green-400' : 'text-gray-300'}>
                    {m.player2}
                  </span>
                  <span className="ml-2 text-xs">{MOVE_EMOJI[m.move2] || m.move2}</span>
                </td>
                <td className="px-4 py-2.5 text-xs">
                  {m.isTie ? (
                    <span className="text-gray-500">TIE</span>
                  ) : (
                    <span className="text-green-400">{m.winner} wins</span>
                  )}
                </td>
                {showOutcomeColumn && (
                  <td className="px-4 py-2.5 text-center">
                    {outcome ? <OutcomeBadge outcome={outcome} /> : <span className="text-xs text-gray-600">—</span>}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}