# Scoring and Leaderboards

This document explains how verified streams become leaderboard points and mission progress.

## High-Level Pipeline

The runtime flow is:

1. Last.fm events are fetched for a verified tracker connection.
2. Each event is normalized and matched against the local BTS-family catalog.
3. The event is stored in `StreamEvent`.
4. Eligible BTS-family events emit leaderboard point events.
5. Current mission instances are ensured.
6. Mission progress is recomputed for the affected user.
7. Mission completions emit mission-completion point events.
8. Dirty boards are materialized into ranked entries and snapshots.

Primary implementation:

- `src/modules/streaming/service.ts`
- `src/modules/missions/service.ts`
- `src/modules/leaderboards/service.ts`

## Stream Scoring Rules

Current value:

- `verified BTS-family stream = platform streamPointValue`
- The current default is `1 point` per verified stream.

Applied boards:

- daily individual
- weekly individual
- daily state
- weekly state

A single eligible stream therefore emits 4 point events.

Conditions:

- The scrobble must match the local BTS-family catalog.
- The user must have a confirmed `region.stateKey`.

Important design detail:

- Point events carry both `periodAt` and `occurredAt`.
- This ensures backlog syncs score against the correct board period and tied rankings use event time instead of ingest time.

Important mechanic detail:

- Verified streams always keep their normal leaderboard value.
- Daily and weekly mission rewards are period-specific.
- This means the weekly board is not guaranteed to be greater than or equal to the daily board for the same user or state.
- Album missions do not change per-stream scoring. They only add mission-completion reward points after the assigned album objective is completed from verified track events.
- Song quests and album quests now use separate default completion reward values, so reward tuning is mechanic-aware even when admin has not set an override.

## Mission Progress Rules

### Individual missions

Progress is stored in `UserMissionProgress`.

- `track_streams`
  - Each target contributes up to its `targetCount`.
- `album_completions`
  - Each completed album contributes `1`.

Reward behavior:

- On first completion, reward points are emitted to:
  - the user’s individual board
  - the user’s state board
  - the user’s place activity event only if a resolved place exists

### State shared missions

Progress is stored in `SharedMissionProgress` with `scopeType: state`.

- Every state has its own progress row for the same live mission definition.
- Each user also gets a `MissionContribution` row.

Reward behavior:

- On first completion for that state, one reward event is emitted to the state board only.
- No place hotspot reward is emitted for state-shared rewards.

### India shared missions

Progress is stored in `SharedMissionProgress` with `scopeType: india`.

- There is one India-wide aggregate progress row.
- Each contributor gets a `MissionContribution` row.

Reward behavior:

- Contributors qualify only if `qualifiedAt <= completedAt`.
- On completion, each qualifying contributor gets one reward on:
  - their individual board
  - their state board
  - their place activity event only if a resolved place exists

Why this matters:

- The first shared completion timestamp is preserved so late contributors do not get rewarded retroactively.

## Leaderboard Materialization

Boards are event-first, not score-first.

### Source of truth

- `LeaderboardPointEvent`

### Materialized read model

- `LeaderboardEntry`
- `LeaderboardRankSnapshot`

### Materialization behavior

- Dirty boards are rebuilt by aggregating all point events for the board.
- Entries are sorted by:
  - score descending
  - `lastQualifiedAt` ascending
  - display name ascending

This gives deterministic ordering for tied scores.

## Board Definitions

Only 4 boards are live:

- `daily + individual`
- `weekly + individual`
- `daily + state`
- `weekly + state`

Location note:

- City leaderboard scoring remains retired.
- Canonical city/town data now feeds the India activity map only.

Board reads are exposed by:

- `src/app/api/v1/leaderboards/route.ts`

Query params:

- `period=daily|weekly`
- `boardType=individual|state`

## Default Live Mission Mix

The current default cell mapping is:

- `daily_india`
  - `track_streams`
  - 10 random tracks
  - goal `250`
- `daily_individual`
  - `album_completions`
  - 1 random album
  - goal `1`
- `daily_state`
  - `track_streams`
  - 10 random tracks
  - goal `50`
- `weekly_india`
  - `album_completions`
  - 5 random albums
  - shared goal `250`
- `weekly_individual`
  - `track_streams`
  - 40 random tracks
  - goal `200`
- `weekly_state`
  - `album_completions`
  - 5 random albums
  - shared goal `50`

This gives a live mix of 6 streaming missions and 6 album-completion missions by default.

## Mission Page Read Model

Mission page data is exposed by:

- `src/app/api/v1/missions/route.ts`

Returned shape:

- `daily: MissionCard[]`
- `weekly: MissionCard[]`
- `lastfmConnection`
- `streamPointValue`
- `verificationStatus`

The page is rendered by:

- `src/app/(app)/missions/page.tsx`

## Reliability Notes

### Retry safety

- Stream rows are deduped by provider event identity.
- Point events are deduped independently by `dedupeKey`.
- This allows a retry to re-score an already-stored stream if point insertion failed before checkpoint update.

### Dirty-board safety

- New point events mark boards dirty.
- `listLeaderboards()` materializes dirty boards on read if needed.
- Cron also exposes explicit materialization.

### Unsupported-provider safety

- Public connection and manual sync routes now validate only Last.fm as a live provider.

### Force-regeneration safety

- Forced daily or weekly mission regeneration replaces the current live mission instances for that period.
- The replacement path intentionally deletes current mission progress, mission contributions, and mission-completion reward point events for the replaced live missions before recreating them.
- Operational rollout sequence for this mixed-mechanic change is:
  - force-regenerate daily missions
  - force-regenerate weekly missions
  - materialize leaderboards immediately after regeneration

## Future Update Checklist

When changing scoring behavior, check all of these:

- point-event shape
- point-event dedupe keys
- board period routing
- mission reward routing
- materialization sort order
- UI copy on mission and leaderboard pages
- admin status cards and sync summaries
