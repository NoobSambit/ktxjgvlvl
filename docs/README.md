# IndiaForBTS Docs

This folder stores product and implementation context that should survive future refactors.

## Structure

- `systems/`
  - Long-lived system documentation for product areas and infrastructure surfaces.

## Current System Docs

- [`systems/admin/README.md`](./systems/admin/README.md)
  - Admin route overview, mission control rules, and links to operational docs.
- [`systems/missions/README.md`](./systems/missions/README.md)
  - Mission V2 overview, terminology, resets, and file map.
- [`systems/location/README.md`](./systems/location/README.md)
  - Canonical India state/place registry, signup/profile rules, and IP fallback behavior.
- [`systems/location/data-model.md`](./systems/location/data-model.md)
  - Mongo collections and user-region fields for canonical locations and fallback city data.
- [`systems/activity-map/README.md`](./systems/activity-map/README.md)
  - State/place activity event flow, materialization, rendering stack, and scoring rules.
- [`systems/missions/data-model.md`](./systems/missions/data-model.md)
  - Mongo collections, key fields, and relationships for missions, leaderboards, and stream scoring.
- [`systems/missions/scoring-and-leaderboards.md`](./systems/missions/scoring-and-leaderboards.md)
  - Point-event model, stream scoring, mission rewards, and board materialization rules.
- [`systems/missions/admin-operations.md`](./systems/missions/admin-operations.md)
  - Admin console behavior, catalog sync, overrides, cron jobs, and operational cautions.

## Notes

- The current mission and leaderboard implementation is the V2 system centered on 6 fixed mission cells.
- City leaderboard scoring is intentionally retired. Only `individual` and `state` boards are live.
- City/town is now optional account metadata used for activity-map hotspots, not competitive gating.
- Last.fm is the only live verification provider in the current build.
