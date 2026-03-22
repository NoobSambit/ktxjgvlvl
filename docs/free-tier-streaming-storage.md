# Free-Tier Streaming Storage

## Goal

Keep the product correct on MongoDB Atlas free tier by preserving only:

- current daily and weekly leaderboard state
- current daily and weekly activity-map state
- current daily and weekly mission state
- tracker checkpoints
- lifetime verified BTS stream totals for users and states

The system no longer treats Mongo as a forever event warehouse.

## New Model

### What stays as source of truth

- `LeaderboardEntry` stores the live current score for each board competitor.
- `LocationActivitySnapshot` stores the live current activity-map counters.
- `MissionInstance`, `UserMissionProgress`, `SharedMissionProgress`, and `MissionContribution` store current mission state.
- `TrackerConnection.lastCheckpoint` remains the sync source of truth.
- `User.streamStats.totalVerifiedBtsStreams` preserves each user's lifetime verified BTS stream total.
- `LocationState.streamStats.totalVerifiedBtsStreams` preserves each state's lifetime verified BTS stream total.

### What is now short-lived

- `StreamEvent` is kept only for BTS-family streams and only for a short rolling retention window.
- `LocationActivityParticipant` keeps one record per user per scope per active period so active-fan counts stay correct without storing one activity event per stream.

### What is no longer needed long-term

- per-stream leaderboard point receipts
- per-stream activity-map event receipts
- closed-period leaderboard snapshots and entries
- closed-period mission progress/contribution documents
- unused legacy streaming collections

## Write Path Changes

When tracker sync imports a newly counted BTS-family stream:

1. The app stores one short-lived `StreamEvent` row for mission correctness and dedupe.
2. The app increments the current leaderboard counters directly.
3. The app increments the current activity snapshot directly.
4. The app increments lifetime stream totals directly for the user and the user's state.
5. Mission progress still uses current-window BTS stream data, but old detailed history is pruned.

No per-stream leaderboard point-event fan-out is written anymore.
No per-stream activity-event fan-out is written anymore.

## Retention Rules

- `StreamEvent`: keep only recent BTS-family rows. Default retention is 14 days.
- `LeaderboardPointEvent`: legacy-only; removed during migration and closed-period cleanup.
- `LocationActivityEvent`: legacy-only; removed during migration and closed-period cleanup.
- `LeaderboardBoard`, `LeaderboardEntry`, `LeaderboardRankSnapshot`: keep only current daily and weekly periods.
- `LocationActivitySnapshot`, `LocationActivityParticipant`: keep only current daily and weekly periods.
- `MissionInstance`, `UserMissionProgress`, `SharedMissionProgress`, `MissionContribution`, `MissionOverride`: keep only current daily and weekly periods.

## Safe Migration Flow

The migration now works in two safe phases so it can run even when Atlas is already over quota:

1. Delete-only emergency cleanup removes closed-period data, non-BTS stream rows, and unused legacy collections.
2. Current daily and weekly leaderboard, activity-map, and mission state are left untouched.
3. Once space is available again, the migration backfills lifetime stream totals from the remaining BTS stream rows.
4. It then prunes old BTS stream rows outside the rolling retention window.
5. Current-period legacy point and activity receipts are left in place temporarily so today's live state stays preserved exactly as-is. They age out naturally when the period closes.

Run:

```bash
npm run migrate:free-tier-storage
```

Optional custom retention:

```bash
npm run migrate:free-tier-storage -- --stream-retention-days=21
```

If the command returns `status: "cleanup_only"`, Atlas still had not applied the freed space by the time the script reached the lifetime-total backfill. In that case, rerun the same command once Atlas reflects the lower storage usage.

## Ongoing Cleanup

Bulk tracker sync now runs a free-tier cleanup step after sync and materialization.

That cleanup:

- removes non-BTS and expired `StreamEvent` rows
- removes closed-period leaderboard, activity-map, and mission data
- clears unused legacy collections that no longer serve the product
- leaves current-period legacy receipts alone until the period rolls over, so no live board data is lost during the transition

## Dropping Empty Legacy Collections

Once migration is complete and the old receipt collections are empty, drop them to reclaim their index/storage footprint fully:

```bash
npm run cleanup:drop-legacy-storage
```

This removes the legacy collections that are no longer part of the live architecture:

- `leaderboardpointevents`
- `locationactivityevents`
- `streamsynccheckpoints`
- `userstreamdailystats`
- `usertrackcounters`
- `regionconfirmations`

## Data That Survives

After migration and cleanup, the product keeps the data the user still cares about:

- current daily leaderboard points
- current weekly leaderboard points
- current mission progress
- current map/activity state
- lifetime verified BTS stream totals for each user
- lifetime verified BTS stream totals for each state

Old detailed per-song history is intentionally not kept beyond the short retention window.
