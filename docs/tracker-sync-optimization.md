# Tracker Sync Optimization

## Problem

The `sync-active-trackers` workflow was timing out before completion as the verified tracker userbase grew.

The failure mode was not a single crashing connection. The workflow was hitting the GitHub Actions time limit because the sync path was doing too much repeated work for every user.

## Root Cause

The previous bulk sync path imported one user's tracker events and then immediately recomputed:

- that user's personal missions
- that user's state shared missions
- India shared missions

This happened for every verified user in the cron loop.

That design had two scaling problems:

1. It re-read the same current daily and weekly BTS stream windows many times.
2. It recalculated shared scopes (`state` and `india`) once per user instead of once per affected scope.

With a larger userbase, India and state shared mission windows now contain large numbers of BTS stream events, so one user's sync was effectively triggering a mini batch recompute of shared progress over and over again.

## Non-Issues Clarified

- The system was not querying MongoDB for the BTS catalog on every stream. BTS-family catalog tracks were already loaded once and reused in memory.
- Per-stream catalog matching is still required for correctness because providers do not return the canonical track identity used by missions and album completion logic.

## What Changed

### 1. Bulk tracker sync now defers mission recomputation

During cron sync, each connection still:

- fetches tracker data
- writes stream events
- records leaderboard and location activity events
- updates checkpoints

But it no longer recomputes missions immediately after every user.

Instead, the cron job collects only the users whose newly inserted BTS-family streams touched the current mission windows and performs mission recomputation in a dedicated batch stage after all imports finish.

### 2. Mission recomputation is now batched by scope

Current mission recomputation now reuses the current daily and weekly stream windows:

- user daily events are loaded once per affected user
- user weekly events are loaded once per affected user
- state daily events are loaded once per affected state
- state weekly events are loaded once per affected state
- India daily events are loaded once per batch
- India weekly events are loaded once per batch

This preserves mission behavior while removing repeated shared-scope recalculation.

### 3. Manual single-user sync keeps immediate behavior

The user-triggered mission verification flow still recomputes immediately so the dashboard and mission page remain fresh after an on-demand sync.

### 4. Stream-to-catalog matching was tightened

The BTS-family matcher index is now grouped by normalized track name in memory so matching work is cheaper per event without changing scoring behavior.

### 5. Hot-path indexes were added

Additional indexes were added for:

- verified tracker connection selection by freshness
- BTS stream event lookups by user + current period
- BTS stream event lookups by state + current period

These match the actual query shapes used by the optimized recompute flow.

## Product Behavior Preserved

The optimization intentionally does not change:

- tracker provider validation
- stream import dedupe rules
- BTS-family catalog matching rules
- mission completion rules
- leaderboard point generation
- location activity generation
- manual mission refresh behavior

## Expected Impact

The largest win comes from removing repeated current-window shared mission recomputation from the per-user sync loop.

Before:

- one user sync could re-read shared India and state mission windows again
- the same current weekly India BTS event set was effectively recalculated many times in one cron run

After:

- tracker imports remain per user
- current mission recompute happens once per affected scope
- materialization still happens after the batch

This should reduce cron runtime substantially and make it much more likely that the workflow can process all verified users within one run.
