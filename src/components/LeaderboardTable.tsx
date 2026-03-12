import type { LeaderboardEntry } from '@/lib/types';

interface Props {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: Props) {
  if (entries.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-900/80 text-xs uppercase tracking-wider text-gray-400">
            <th className="w-16 px-4 py-3 text-center">#</th>
            <th className="px-4 py-3 text-left">Player</th>
            <th className="px-4 py-3 text-right">Wins</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {entries.map((e, i) => (
            <tr key={e.player} className="transition-colors hover:bg-gray-900/40">
              <td className="px-4 py-2.5 text-center font-mono text-xs text-gray-500">{i + 1}</td>
              <td className="px-4 py-2.5 font-medium text-gray-200">{e.player}</td>
              <td className="px-4 py-2.5 text-right font-mono text-green-400">{e.wins.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}