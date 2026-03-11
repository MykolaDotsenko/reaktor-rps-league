import { HistoryPageSchema } from './schemas';

const API_BASE = 'https://assignments.reaktor.com';

class NonRetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonRetryableError';
  }
}

function parseRetryAfterMs(value: string | null): number | null {
  if (!value) return null;

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1000;
  }

  const when = Date.parse(value);
  if (Number.isNaN(when)) return null;

  return Math.max(0, when - Date.now());
}

export async function fetchApi(
  path: string,
  token: string,
  maxRetries = 3
): Promise<Response> {
  if (!path.startsWith('/')) {
    throw new Error(`Path must start with "/": ${path}`);
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    let retryAfterMs: number | null = null;

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      if (res.ok) return res;

      if (res.status === 429) {
        retryAfterMs = parseRetryAfterMs(res.headers.get('retry-after'));
        lastError = new Error(`Rate limited (429) for ${path}`);
      } else if (res.status >= 400 && res.status < 500) {
        throw new NonRetryableError(`Client error ${res.status} for ${path}`);
      } else {
        lastError = new Error(`Server error ${res.status} for ${path}`);
      }
    } catch (err) {
      if (err instanceof NonRetryableError) throw err;

      if (err instanceof Error && err.name === 'AbortError') {
        lastError = new Error(`Request timed out for ${path}`);
      } else {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    } finally {
      clearTimeout(timeout);
    }

    if (attempt < maxRetries) {
      const baseDelay =
        1000 * Math.pow(2, attempt) * (0.8 + Math.random() * 0.4);
      const delay = retryAfterMs ?? baseDelay;

      console.log(
        `  [RETRY] ${attempt + 1}/${maxRetries}, waiting ${Math.round(delay)}ms`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error(`Failed after ${maxRetries} retries: ${path}`);
}

export async function fetchAllHistory(token: string): Promise<unknown[]> {
  const all: unknown[] = [];
  const seenCursors = new Set<string>();

  let cursor: string | undefined = '/history';
  let page = 0;

  while (cursor) {
    if (seenCursors.has(cursor)) {
      throw new Error(`Pagination loop detected at cursor: ${cursor}`);
    }

    seenCursors.add(cursor);

    console.log(`  Page ${++page}: ${cursor}`);
    const res = await fetchApi(cursor, token);

    let json: unknown;
    try {
      json = await res.json();
    } catch {
      throw new Error(`Invalid JSON on page ${page}: ${cursor}`);
    }

    const parsed = HistoryPageSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error(`Bad page ${page}: ${parsed.error.message}`);
    }

    all.push(...parsed.data.data);
    cursor = parsed.data.cursor ?? undefined;
  }

  console.log(`  Done: ${page} pages, ${all.length} records`);
  return all;
}