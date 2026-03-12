# RPS League

A web application that consumes the Reaktor Rock-Paper-Scissors legacy API, normalizes the data, and presents match results and leaderboards.

## Tech Stack

- **Next.js 15** (App Router) — full-stack React framework
- **TypeScript** (strict mode) — type safety
- **Zod** — runtime validation of untrusted API data
- **Tailwind CSS** — utility-first styling
- **Route Handlers** — server-side BFF layer (token never exposed to client)

## Architecture

```
Browser → Next.js Pages (Server Components)
              ↓
         lib/data.ts (cached in-memory snapshot)
              ↓
         lib/queries.ts (pure functions)

Separately:
  scripts/sync.ts → Legacy API → normalize → data/normalized.json
  scripts/answers.ts → same query layer → form answers
```

**Key design decisions:**

- **Server-only token:** The API bearer token lives in `.env.local` and is only used in server-side scripts. It never reaches the browser.
- **Offline-first data:** The sync script fetches all history pages, validates with Zod, normalizes into a canonical model, and writes a JSON snapshot. The app reads this snapshot — it never calls the legacy API at runtime.
- **Canonical domain model:** Raw API records are transformed into a clean `Match` type with computed `winner` and `isTie` fields. All queries and UI work against this model, not raw API shapes.
- **Single source of truth for answers:** The `answers.ts` script uses the exact same query functions as the UI, ensuring consistency.

## How to Run

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local and add your API token

# 3. Sync data from the legacy API
npm run sync

# 4. Start development server
npm run dev

# 5. Run answer script (for submission form)
npm run answers

# 6. Run tests
npm run test
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run sync` | Fetch all history from legacy API → `data/normalized.json` |
| `npm run answers` | Print answers for the submission form |
| `npm run test` | Run unit tests with Vitest |

## Features

All five requested features are implemented:

1. **Latest match results** — Home page shows the 50 most recent matches
2. **Matches on a given day** — `/day` page with date picker, defaults to latest available day
3. **Player match history** — `/player` page with exact name lookup and WIN/LOSE/TIE outcome badges
4. **Today's leaderboard** — Home page bottom section, with fallback to latest available day if no matches today
5. **Historical leaderboard** — `/leaderboard` page with date range picker, defaults to last 7 days

## Assumptions and Decisions

- **Valid moves:** Only `ROCK`, `PAPER`, `SCISSORS` are accepted. Records with other values (e.g. `"DOG"`) are excluded via Zod validation. This affected 56,614 records (32% of raw data).
- **Bad timestamps:** Records with non-positive timestamps are excluded. This affected 23,438 records (13% of raw data).
- **Self-play:** When both players have the same name (e.g. "Mateo Müller" vs "Mateo Müller"), the match is forced to a tie with no winner, regardless of moves. This prevents ambiguous outcomes and keeps the leaderboard fair.
- **Deduplication:** Records with duplicate `gameId` are counted once (first occurrence kept). Found 2,847 duplicates.
- **UTC everywhere:** All dates and times use UTC. Day boundaries use half-open intervals: `[start, end)` where start = `YYYY-MM-DDT00:00:00.000Z` and end = next day same time.
- **Tie-break sorting:** Leaderboard sorts by wins descending, then player name A–Z for equal wins.

## Bad API Challenges

The legacy API presented several challenges:

- **Massive pagination:** 583 pages had to be traversed sequentially via cursor-based pagination. No random access or date-based filtering available server-side.
- **45% invalid data:** Out of 180,660 raw records, only 97,761 (54%) were valid. Invalid records included non-standard moves (56,614) and bad timestamps (23,438).
- **Duplicate records:** 2,847 records appeared on multiple pages, likely due to pagination instability.
- **Non-linear pagination:** Some cursor values led back to previously visited pages, requiring deduplication at the cursor level.
- **Rate limiting:** The API returned 429 responses intermittently, handled with exponential backoff and Retry-After header parsing.
- **No documentation beyond root page:** Only two endpoints documented (`/history` and `/live`), requiring exploration-first approach.

## Trade-offs

- **In-memory JSON snapshot over database:** For ~98k records, `Array.filter().sort()` takes single-digit milliseconds. A database (PostgreSQL, SQLite) would be the right choice for production scale, but adds deployment complexity and setup time without measurable benefit at this dataset size.
- **Exact player search over fuzzy/partial:** Chose exact name matching for correctness of outcome badges. Partial matching could show WIN/LOSE for the wrong player. Trade-off documented in UI.
- **Server Components over client-side fetching:** Pages call query functions directly on the server. No client-side data fetching, no loading spinners, no cache invalidation. Simpler and faster for a snapshot-based architecture.
- **No SSE/live integration:** The `/live` endpoint was deprioritized in favor of getting all five features working correctly with historical data. Would be the first addition with more time.

## Future Improvements

With more time, I would add:

- **PostgreSQL persistence** with proper indexing for production-scale queries
- **Incremental sync** via cursor bookmarking instead of full re-fetch
- **SSE `/live` integration** for real-time match updates
- **Player autocomplete** search with partial matching
- **Player statistics page** (win rate, favorite move, head-to-head records)
- **CI/CD pipeline** with automated testing
- **E2E tests** with Playwright
- **Proper observability** (structured logging, error tracking)

## AI Usage

Used **Claude** and **ChatGPT** throughout the project as thinking partners:

- **ChatGPT:** Used for reasoning through architectural decisions and discussing trade-offs. Helped evaluate different approaches (SQLite vs in-memory, monorepo vs single app, SSE priority) through back-and-forth discussion before committing to a direction.
- **Claude:** Used as a code reviewer and implementation partner. Helped identify edge cases (self-play normalization, pagination loops, UTC boundary bugs), reviewed each module for bugs, and assisted with README structure.
- **Gemini:** Used as an additional review tool for finding bugs and validating implementation decisions from a different perspective.
- **Architecture decisions:** All three tools helped explore options; final decisions were mine based on homework constraints and deadline.
- **Code review:** Claude found the missing singleton cache in the data loader and the self-play inconsistency between normalization and query layers.

All domain logic, validation rules, query implementations, and architectural choices were verified and understood by me. 
