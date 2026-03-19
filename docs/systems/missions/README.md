# Missions, Leaderboards, and Admin

This directory documents the current Mission V2 system used by IndiaForBTS.

## Scope

The current implementation covers:

- 6 live mission cells:
  - `daily_india`
  - `daily_individual`
  - `daily_state`
  - `weekly_india`
  - `weekly_individual`
  - `weekly_state`
- 12 live mission instances:
  - each cell now runs both `track_streams` and `album_completions`
- 4 leaderboard boards:
  - daily individual
  - weekly individual
  - daily state
  - weekly state
- 1 live verification provider:
  - Last.fm
- 1 catalog source flow:
  - sync BTS-family tracks and albums into the local Mongo database

## Product Model

### Mission kinds

- `india_shared`
  - One India-wide aggregate song mission and one India-wide aggregate album mission per cadence.
- `individual_personal`
  - One personal song mission and one personal album mission per cadence; every user progresses against the same target set independently.
- `state_shared`
  - One shared song mission and one shared album mission per cadence; each state gets its own aggregate progress row.

### Mission mechanics

- `track_streams`
  - Progress is counted from verified BTS-family track plays.
- `album_completions`
  - Progress is counted when all target tracks from a target album are present in the mission window.

### Supported reward routing

- `individual_and_state`
  - Completion reward goes to the user’s individual board and their state board.
- `state_only`
  - Completion reward goes only to the state board.
- `contributor_individual_and_state`
  - India shared mission contributors who qualified before mission completion receive rewards on both boards.

## Reset Rules

All mission and leaderboard periods use `Asia/Kolkata`.

- Daily reset: `00:00 Asia/Kolkata`
- Weekly reset: `00:00 Asia/Kolkata` on Monday

Period key format:

- Daily: `daily-YYYY-MM-DD`
- Weekly: `weekly-YYYY-WW`

Implementation lives in `src/platform/time/india-periods.ts`.

## Current Defaults

Defined in `src/modules/missions/config.ts`.

- Every cell generates both mechanics in parallel:
  - `track_streams`
    - uses the configured random track count, goal, and reward for that cell
  - `album_completions`
    - uses the configured random album count, goal, and reward for that cell
- This produces a default live mix of 6 streaming missions and 6 album-completion missions.

## UI Surface Map

### User-facing screens

- Missions page:
  - `src/app/(app)/missions/page.tsx`
  - Renders two sections, `Daily` and `Weekly`, each with both song and album missions across all 3 scopes.
- Leaderboards page:
  - `src/app/(app)/leaderboards/page.tsx`
  - Renders the 4 boards only.
- Mission actions:
  - `src/components/missions/mission-actions.tsx`
  - Connects Last.fm and triggers manual verification refresh.

### Admin-facing screen

- Admin page:
  - `src/app/(admin)/admin/page.tsx`
- Mission admin console:
  - `src/components/admin/mission-admin-console.tsx`

## Service Map

- Mission orchestration:
  - `src/modules/missions/service.ts`
- Stream ingest and verification:
  - `src/modules/streaming/service.ts`
- Leaderboard scoring and materialization:
  - `src/modules/leaderboards/service.ts`
- Catalog sync:
  - `src/modules/catalog/service.ts`

## Important Current Constraints

- Only Last.fm is supported for live mission verification.
- Users must have a confirmed `region.state` to earn stream points or mission rewards.
- Random/default mission generation now creates both mechanics for every cell and randomizes tracks or albums per mechanic.
- Admin overrides may target `track_streams` or `album_completions` independently for the same cell.
- The admin UI only plans the next daily or weekly period. Current live missions are locked from the admin console.
- If no next-period override exists for a cell mechanic, reset-time generation falls back to that mechanic’s random BTS-family track or album selection.
- Forced regeneration of a live mission period intentionally resets current mission progress, mission contributions, and mission-completion reward events for the replaced live missions.

## Read Next

- [`../admin/README.md`](../admin/README.md)
- [`data-model.md`](./data-model.md)
- [`scoring-and-leaderboards.md`](./scoring-and-leaderboards.md)
- [`admin-operations.md`](./admin-operations.md)
