# RPS League — Reaktor

[**Live demo →**](https://reaktor-rps-zeta.vercel.app/)

A Next.js case study for turning a difficult legacy Rock-Paper-Scissors API into a stable league view with normalized match history, player results and leaderboards.

The interesting part is the data boundary: provider records are validated, normalized into an application-owned snapshot and queried through one shared set of pure functions. The bearer token never reaches the browser.

## Legacy API reality

The source API was not clean enough to use directly.

One full snapshot exposed:

- **180,660 raw match records**;
- only **97,761 valid records** after validation;
- **56,614 records** with unsupported moves;
- **23,438 records** with invalid/non-positive timestamps;
- **2,847 duplicate game IDs**;
- **583 cursor-paginated pages**;
- pagination cursors that could loop back to already visited pages;
- intermittent `429` rate limiting.

The sync layer therefore has to do more than “fetch JSON”.

## Data pipeline

```text
Legacy API
   ↓
cursor traversal + rate-limit handling
   ↓
Zod validation
   ↓
deduplication + normalization
   ↓
data/normalized.json
   ↓
shared query layer
   ├── Next.js pages
   └── submission/answer script
```

The application never exposes raw provider payloads to the UI.

## Important decisions

### Canonical match model

Raw records become a clean `Match` shape with computed winner/tie state.

The UI, leaderboard code and answer-generation script all use this same model.

### Snapshot instead of runtime API calls

The sync script fetches and validates history ahead of time. The deployed application reads the checked snapshot rather than depending on the unreliable provider during every page request.

For the current ~98k valid records, in-memory query operations are fast enough that adding a database would increase deployment/setup complexity without solving a measured bottleneck.

### Server-only token

The provider bearer token is used only by server-side tooling. It is not bundled into browser code.

### Explicit data rules

- only `ROCK`, `PAPER`, `SCISSORS` are valid moves;
- non-positive timestamps are rejected;
- duplicate `gameId` values count once;
- day boundaries use UTC half-open intervals;
- leaderboard ties sort by player name after win count;
- self-play is normalized to a tie to avoid ambiguous player outcomes.

## Product features

- latest match results;
- matches for a selected day;
- exact-name player history with WIN / LOSE / TIE;
- daily leaderboard;
- historical leaderboard over a date range.

## Architecture

```text
Browser
  ↓
Next.js Server Components
  ↓
lib/data.ts
  ↓
lib/queries.ts

scripts/sync.ts
  ↓
legacy API → normalize → data/normalized.json

scripts/answers.ts
  ↓
same lib/queries.ts functions
```

The page layer does not reimplement business queries, and the submission answers do not use a parallel code path.

## Stack

- Next.js 16
- React 19
- TypeScript
- Zod
- Tailwind CSS
- Vitest

## Run locally

```bash
npm install
cp .env.example .env.local
# add the legacy API token
npm run sync
npm run dev
```

Useful commands:

```bash
npm run test
npm run build
npm run answers
```

## Scope

The project focuses on making the historical-data assignment correct and reproducible.

A production service with continuously changing history would likely move toward incremental ingestion and persistent indexed storage rather than rebuilding a full JSON snapshot.
