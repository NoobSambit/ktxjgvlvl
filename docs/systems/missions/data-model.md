# Data Model

This document describes the Mongo collections that back mission generation, shared progress, stream scoring, and leaderboard ranking.

## Core Collections

### Mission instances

Model:

- `src/platform/db/models/missions.ts`

Collection purpose:

- Stores the live mission definition for a specific mission cell, mechanic, and India-time period.

Important fields:

- `schemaVersion`
- `cadence`
- `missionCellKey`
- `missionKind`
- `mechanicType`
- `periodKey`
- `startsAt`
- `endsAt`
- `goalUnits`
- `rewardRouting`
- `rewardPoints`
- `selectionMode`
- `targetConfig.targets`
- `isActive`

Identity:

- Unique on `schemaVersion + missionCellKey + mechanicType + periodKey`

Notes:

- Legacy compatibility field `slotKey` still exists because older indexes already existed in Mongo.
- Current code only reads `schemaVersion: 2`.

### Mission overrides

Purpose:

- Stores admin overrides for the active daily or weekly period and mechanic.

Important fields:

- `missionCellKey`
- `cadence`
- `periodKey`
- `mechanicType`
- `targetKeys`
- `goalUnits`
- `rewardPoints`
- `createdById`
- `updatedById`

Identity:

- Unique on `schemaVersion + missionCellKey + mechanicType + periodKey`

Operational note:

- Saving or clearing an override for the current period triggers forced regeneration for that cell.

### User mission progress

Purpose:

- Tracks user-specific progress for `individual_personal` missions.

Important fields:

- `missionInstanceId`
- `userId`
- `progressValue`
- `completedAt`
- `rewardAwardedAt`
- `targetProgress`

Identity:

- Unique on `schemaVersion + missionInstanceId + userId`

### Shared mission progress

Purpose:

- Tracks aggregate mission progress for shared mission scopes.

Scope types:

- `india`
- `state`

Important fields:

- `missionInstanceId`
- `scopeType`
- `scopeKey`
- `scopeLabel`
- `progressValue`
- `goalUnits`
- `contributorCount`
- `targetProgress`
- `completedAt`
- `rewardAwardedAt`

Identity:

- Unique on `schemaVersion + missionInstanceId + scopeType + scopeKey`

Scope key conventions:

- India scope: `india:all`
- State scope: `state:<slug>`

### Mission contributions

Purpose:

- Tracks each user’s contribution into shared missions and reward eligibility.

Important fields:

- `missionInstanceId`
- `userId`
- `contributionUnits`
- `stateKey`
- `qualifiedAt`
- `rewardAwardedAt`

Identity:

- Unique on `schemaVersion + missionInstanceId + userId`

Notes:

- `qualifiedAt` matters for India shared reward issuance.
- For track mechanics it is the first qualifying target stream time.
- For album mechanics it is the first album-completion time.

## Leaderboard Collections

### Leaderboard boards

Model:

- `src/platform/db/models/leaderboards.ts`

Purpose:

- Stores one board per `boardType + periodKey`.

Board types:

- `individual`
- `state`

Important fields:

- `schemaVersion`
- `boardType`
- `period`
- `periodKey`
- `startsAt`
- `endsAt`
- `isDirty`
- `lastMaterializedAt`

Identity:

- Unique on `schemaVersion + boardType + periodKey`

Notes:

- Legacy compatibility fields `scopeType`, `scopeKey`, and `scopeLabel` still exist to coexist with old indexes.

### Leaderboard point events

Purpose:

- Append-only score events used as the source of truth for board totals.

Important fields:

- `boardId`
- `boardType`
- `period`
- `periodKey`
- `competitorType`
- `competitorKey`
- `displayName`
- `points`
- `occurredAt`
- `sourceType`
- `sourceId`
- `dedupeKey`

Supported source types:

- `verified_stream`
- `mission_completion`
- `admin_adjustment`

Identity:

- Unique on `dedupeKey`

Why this matters:

- Retries stay safe because points are de-duped at the event level.
- Rank materialization can be rebuilt from events at any time.

### Leaderboard entries

Purpose:

- Stores the current materialized ranking for a board.

Important fields:

- `boardId`
- `competitorType`
- `competitorKey`
- `userId`
- `stateKey`
- `displayName`
- `score`
- `rank`
- `previousRank`
- `lastQualifiedAt`

Identity:

- Unique on `boardId + competitorKey`

### Leaderboard rank snapshots

Purpose:

- Stores top-entry snapshots for fast board reads and historical comparison.

Important fields:

- `boardId`
- `topEntries`
- `generatedAt`
- `totalParticipants`

## Stream and Catalog Collections

### Stream events

Model:

- `src/platform/db/models/streaming.ts`

Purpose:

- Stores normalized tracker events imported from Last.fm.

Important fields:

- `userId`
- `provider`
- `providerUserKey`
- `providerEventKey`
- `playedAt`
- `normalizedTrackKey`
- `normalizedArtistKey`
- `catalogTrackId`
- `catalogAlbumId`
- `catalogTrackSpotifyId`
- `catalogAlbumSpotifyId`
- `isBTSFamily`
- `stateKey`
- `stateLabel`

Identity:

- Unique on `provider + providerUserKey + providerEventKey`

Notes:

- All imported scrobbles can be stored.
- Only `isBTSFamily === true` events score points or mission progress.

### Catalog tracks and albums

Model:

- `src/platform/db/models/catalog.ts`

Purpose:

- Local mission and verification catalog copied into IndiaForBTS Mongo.

Important flags:

- `isBTSFamily`

Usage:

- Random mission generation reads local catalog data.
- Stream classification matches imported scrobbles against local catalog tracks.

## Supporting Collections

### Tracker connections

Purpose:

- Stores the connected Last.fm username and sync checkpoints for each user.

Used by:

- mission verification
- cron-based tracker sync
- mission page connection state

### Platform settings

Model:

- `src/platform/db/models/platform-settings.ts`

Current use:

- `streamPointValue`

Reason it exists:

- This is the expansion hook for future scoring tuning without another schema redesign.
