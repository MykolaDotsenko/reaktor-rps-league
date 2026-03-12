'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

interface Props {
  initialDate: string;
}

export function DayFilterForm({ initialDate }: Props) {
  const [date, setDate] = useState(initialDate);
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!date) return;
    router.push(`/day?date=${date}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="day-date" className="mb-1 block text-xs text-gray-500">Date (UTC)</label>
        <input id="day-date" type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600" />
      </div>
      <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500">Search</button>
    </form>
  );
}