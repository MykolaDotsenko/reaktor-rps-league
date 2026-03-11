export function isValidDate(input: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return false;

  const d = new Date(`${input}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === input;
}

export function getUtcDayRange(date: string): { start: string; end: string } {
  if (!isValidDate(date)) {
    throw new Error(`Invalid UTC date: ${date}`);
  }

  const start = `${date}T00:00:00.000Z`;
  const d = new Date(start);
  d.setUTCDate(d.getUTCDate() + 1);

  return { start, end: d.toISOString() };
}

export function isInRange(ts: string, start: string, end: string): boolean {
  return ts >= start && ts < end;
}

export function getTodayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}