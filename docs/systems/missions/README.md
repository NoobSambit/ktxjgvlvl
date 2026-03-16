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
  - One India-wide aggregate mission per cadence.
- `individual_personal`
  - One personal mission definition per cadence; every user progresses against the same target set independently.
- `state_shared`
  - One shared mission definition per cadence; each state gets its own aggregate progress row.

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

- `daily_india`
  - default mechanic: `track_streams`
  - 10 random track targets
  - goal `250`
  - completion rewards:
    - `track_streams`: `25`
    - `album_completions`: `40`
- `daily_individual`
  - default mechanic: `album_completions`
  - 1 random album target
  - goal `1`
  - completion rewards:
    - `track_streams`: `50`
    - `album_completions`: `75`
- `daily_state`
  - default mechanic: `track_streams`
  - 10 random track targets
  - goal `50`
  - completion rewards:
    - `track_streams`: `100`
    - `album_completions`: `140`
- `weekly_india`
  - default mechanic: `album_completions`
  - 5 random album targets
  - shared goal `250`
  - completion rewards:
    - `track_streams`: `120`
    - `album_completions`: `200`
- `weekly_individual`
  - default mechanic: `track_streams`
  - 40 random track targets
  - 5 streams per target
  - goal `200`
  - completion rewards:
    - `track_streams`: `300`
    - `album_completions`: `420`
- `weekly_state`
  - default mechanic: `album_completions`
  - 5 random album targets
  - shared goal `50`
  - completion rewards:
    - `track_streams`: `600`
    - `album_completions`: `800`

This produces a default live mix of 3 streaming cells and 3 album-completion cells.

## UI Surface Map

### User-facing screens

- Missions page:
  - `src/app/(app)/missions/page.tsx`
  - Renders two sections, `Daily` and `Weekly`, each with 3 cards.
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
- Random/default mission generation follows the cell’s configured default mechanic and can randomize either tracks or albums.
- Admin overrides may use `track_streams` or `album_completions`.
- The admin UI only plans the next daily or weekly period. Current live missions are locked from the admin console.
- If no next-period override exists for a mission cell, reset-time generation falls back to that cell’s default mechanic and random BTS-family track or album selection.
- Forced regeneration of a live mission period intentionally resets current mission progress, mission contributions, and mission-completion reward events for the replaced live missions.

## Read Next

- [`../admin/README.md`](../admin/README.md)
- [`data-model.md`](./data-model.md)
- [`scoring-and-leaderboards.md`](./scoring-and-leaderboards.md)
- [`admin-operations.md`](./admin-operations.md)
