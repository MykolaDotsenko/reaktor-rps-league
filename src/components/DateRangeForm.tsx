'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

interface Props {
  initialFrom: string;
  initialTo: string;
}

export function DateRangeForm({ initialFrom, initialTo }: Props) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!from || !to) return;
    router.push(`/leaderboard?from=${from}&to=${to}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="lb-from" className="mb-1 block text-xs text-gray-500">From (UTC)</label>
        <input id="lb-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)}
          className="rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600" />
      </div>
      <div>
        <label htmlFor="lb-to" className="mb-1 block text-xs text-gray-500">To (UTC)</label>
        <input id="lb-to" type="date" value={to} onChange={(e) => setTo(e.target.value)}
          className="rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600" />
      </div>
      <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500">Search</button>
    </form>
  );
}