# Systems

System docs are organized by domain instead of by file so future updates can keep product intent, data shape, and runtime behavior in one place.

## Available Domains

- [`admin/`](./admin/README.md)
  - Admin route layout, mission planning controls, and operational constraints.
- [`location/`](./location/README.md)
  - Canonical India state/place registry, signup/profile validation, and IP fallback rules.
- [`activity-map/`](./activity-map/README.md)
  - State/place activity events, snapshot materialization, and map rendering behavior.
- [`missions/`](./missions/README.md)
  - Mission generation, shared progress, stream verification, leaderboard scoring, and admin controls.
