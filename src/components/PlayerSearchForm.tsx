'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

interface Props {
  initialName: string;
  initialDate: string;
}

export function PlayerSearchForm({ initialName, initialDate }: Props) {
  const [name, setName] = useState(initialName);
  const [date, setDate] = useState(initialDate);
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const params = new URLSearchParams({ name: name.trim() });
    if (date) params.set('date', date);
    router.push(`/player?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="player-name" className="mb-1 block text-xs text-gray-500">Player name</label>
        <input id="player-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Amara Chen (full name)"
          className="w-56 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600" />
      </div>
      <div>
        <label htmlFor="player-date" className="mb-1 block text-xs text-gray-500">Date (optional)</label>
        <input id="player-date" type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600" />
      </div>
      <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500">Search</button>
    </form>
  );
}