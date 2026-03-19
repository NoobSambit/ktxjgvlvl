# Admin Operations

This document explains how the admin mission console works after the next-period planning revamp.

## Admin Surface

Main entry points:

- Admin page:
  - `src/app/(admin)/admin/page.tsx`
- Mission console:
  - `src/components/admin/mission-admin-console.tsx`
- Admin state builder:
  - `src/modules/missions/service.ts`

## What the Admin Console Shows

For each of the 6 mission cells:

- label and description
- `Live now` mission state
  - current live mission definition
  - selection mode: `admin` or `random`
  - reward points
  - live aggregate progress
  - contributor count when relevant
  - state breakdown for `state_shared` cells
- `Next up` planner state
  - next editable period key
  - preview mission that will run at the next reset
  - searchable target picker for songs or albums depending on mechanic
  - target thumbnails loaded from the local catalog
  - mechanic-aware default goal units and completion reward values
  - override form for:
  - `mechanicType`
  - `targetKeys`
  - `goalUnits`
  - `rewardPoints`

It also shows:

- catalog counts
- current daily and weekly period keys
- next daily and weekly period keys
- stream point value
- last tracker sync
- last mission generation
- last leaderboard materialization

## Catalog Sync

Admin API:

- `src/app/api/v1/admin/catalog-sync/route.ts`

Service:

- `src/modules/catalog/service.ts`

Behavior:

- Reads BTS-family tracks and albums from the source Mongo URI.
- Writes them into the local IndiaForBTS Mongo database.
- Returns sync summary plus fresh admin state.

Operational note:

- The env name `ARMYVERSE_MONGODB_URI` is internal only. It is the source catalog database, not a product-facing label.

## Override Save and Clear

Admin API:

- `src/app/api/v1/admin/mission-overrides/route.ts`

Save flow:

1. Validate `missionCellKey`, mechanic, targets, goal, and reward.
2. Confirm the selected targets exist in the local catalog.
3. Reject unreachable personal mission goals.
4. Upsert the period-specific override for the next reset only.
5. Rebuild admin state so the `Next up` preview reflects the saved override.

Clear flow:

1. Delete the next-period override for the selected mission cell.
2. Rebuild admin state so the `Next up` preview falls back to random selection.

Important rule:

- Save and clear no longer mutate the current live mission.
- Save and clear no longer reset current mission progress.
- Admin can only plan:
  - tomorrow’s daily missions
  - next week’s weekly missions

The admin UI does not support editing:

- today’s live missions
- this week’s live missions
- arbitrary dates beyond the next reset

## Why Current Missions Stay Locked

Mission progress, contribution state, and mission-completion rewards are all keyed by `missionInstanceId`.

Changing a live mission definition in place is unsafe because it can:

- invalidate already-earned progress
- misapply rewards to a new target set
- force destructive cleanup for current users

That destructive path still exists at the service level for explicit mission regeneration, but the admin console intentionally no longer exposes it.

## Random Fallback Rules

Random mission generation currently:

- generates both mechanics for every cell
- selects from local `isBTSFamily: true` catalog rows
- excludes a set of low-quality random picks such as:
  - remix
  - acoustic
  - instrumental
  - karaoke
  - demo
  - cover
  - acapella
  - sped up
  - slowed

Default cell mapping:

- `daily_india`
  - `track_streams`
    - 10 random tracks
  - `album_completions`
    - 1 random album
- `daily_individual`
  - `track_streams`
    - 5 random tracks
  - `album_completions`
    - 1 random album
    - goal `1`
- `daily_state`
  - `track_streams`
    - 10 random tracks
  - `album_completions`
    - 1 random album
- `weekly_india`
  - `track_streams`
    - 20 random tracks
  - `album_completions`
    - 5 random albums
    - shared goal `250`
- `weekly_individual`
  - `track_streams`
    - 40 random tracks
  - `album_completions`
    - 5 random albums
- `weekly_state`
  - `track_streams`
    - 20 random tracks
  - `album_completions`
    - 5 random albums
    - shared goal `50`

Important limitation:

- The local catalog may still contain alternate versions that are not blocked by the current keyword filters.
- Album randomization also depends on `isEligibleAlbum()` and requires enough eligible BTS-family albums in the local catalog.
- If the product needs stricter curation later, update the random eligibility filters in mission generation rather than patching the UI.

Operational behavior:

- If no override exists for the next period and mechanic, the admin console shows a random preview.
- At reset time, the generator uses the same random-selection path and mechanic-specific completion reward to create the real mission instance for both mechanics.
- The current live mission remains unchanged until that reset happens.

## Force Regeneration

Internal cron routes:

- `src/app/api/internal/cron/generate-daily-missions/route.ts`
- `src/app/api/internal/cron/generate-weekly-missions/route.ts`

Behavior:

- Both routes accept `force=true` either as a query param or in the JSON request body.
- `force=true` replaces the current live mission instances for that cadence immediately.
- This intentionally resets current mission progress, mission contributions, and mission-completion reward events for the replaced live missions.
- This path is for controlled rollout and recovery operations, not routine admin planning.

Rollout sequence for the mixed-mechanic launch:

1. Force-regenerate daily missions.
2. Force-regenerate weekly missions.
3. Materialize leaderboards immediately after regeneration.

## Cron Jobs

Implementation:

- `src/platform/jobs/cron.ts`

Relevant jobs:

- `generate-daily-missions`
- `generate-weekly-missions`
- `sync-active-trackers`
- `materialize-leaderboards`
- `materialize-location-activity`

Current behavior:

- mission generation ensures the correct period cells exist for the active current period
- force mission generation can also replace the current live daily or weekly cells in-place
- tracker sync imports verified Last.fm events, emits stream points, recomputes mission progress, and materializes boards
- leaderboard materialization can also run independently
- location activity materialization can also run independently

## Environment Variables to Know

Mission/admin related env:

- `MONGODB_URI`
- `ARMYVERSE_MONGODB_URI`
- `LASTFM_API_KEY`
- `IP_GEOLOCATION_PROVIDER`
- `IP_GEOLOCATION_API_KEY`
- `CRON_SECRET`
- `APP_URL`
- `DISABLE_CRON_AUTH`

Notes:

- `LASTFM_API_KEY` must be set for real Last.fm verification.
- `DISABLE_CRON_AUTH=true` is suitable only for local development.

## Safe Change Checklist

Before changing missions or leaderboards in future updates, check:

- mission config defaults
- mission schema changes
- override validation
- reward-routing logic
- point-event dedupe rules
- next-period-only admin planning behavior
- current-mission immutability in the admin console
- random fallback preview behavior
- admin state rendering
- cron summaries
