import { describe, it, expect } from 'vitest';
import { getUtcDayRange, isInRange, isValidDate } from '../lib/utc';

describe('getUtcDayRange', () => {
  it('returns correct range for a normal day', () => {
    const r = getUtcDayRange('2026-03-09');
    expect(r.start).toBe('2026-03-09T00:00:00.000Z');
    expect(r.end).toBe('2026-03-10T00:00:00.000Z');
  });

  it('handles month boundary', () => {
    const r = getUtcDayRange('2026-01-31');
    expect(r.start).toBe('2026-01-31T00:00:00.000Z');
    expect(r.end).toBe('2026-02-01T00:00:00.000Z');
  });

  it('handles year boundary', () => {
    const r = getUtcDayRange('2025-12-31');
    expect(r.start).toBe('2025-12-31T00:00:00.000Z');
    expect(r.end).toBe('2026-01-01T00:00:00.000Z');
  });
});

describe('isInRange (half-open interval)', () => {
  const start = '2026-03-09T00:00:00.000Z';
  const end = '2026-03-10T00:00:00.000Z';

  it('includes start boundary', () => {
    expect(isInRange('2026-03-09T00:00:00.000Z', start, end)).toBe(true);
  });

  it('excludes end boundary', () => {
    expect(isInRange('2026-03-10T00:00:00.000Z', start, end)).toBe(false);
  });

  it('includes mid-day timestamp', () => {
    expect(isInRange('2026-03-09T14:30:00.000Z', start, end)).toBe(true);
  });

  it('excludes timestamp before start', () => {
    expect(isInRange('2026-03-08T23:59:59.999Z', start, end)).toBe(false);
  });
});

describe('isValidDate', () => {
  it('accepts valid YYYY-MM-DD', () => {
    expect(isValidDate('2026-03-09')).toBe(true);
  });

  it('rejects wrong format', () => {
    expect(isValidDate('09-03-2026')).toBe(false);
  });

  it('rejects impossible date Feb 30', () => {
    expect(isValidDate('2026-02-30')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidDate('')).toBe(false);
  });

  it('rejects partial date without leading zeros', () => {
    expect(isValidDate('2026-3-9')).toBe(false);
  });
});