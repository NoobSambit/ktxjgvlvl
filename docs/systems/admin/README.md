# Admin Surface

This directory documents the current `/admin` experience and the operational rules behind it.

## Current Scope

The admin page currently includes:

- a high-level platform overview
- scheduled job visibility
- chart snapshot/status cards
- the mission planning console
- location registry counts and import timestamps
- location activity materialization status

Primary route:

- `src/app/(admin)/admin/page.tsx`

## Mission Planning Rules

The mission console is the most important admin surface right now.

- Live daily and weekly missions are read-only once generated.
- Admin can plan only:
  - the next daily period
  - the next weekly period
- Admin cannot directly mutate:
  - the current live daily mission
  - the current live weekly mission
  - arbitrary future periods beyond the next reset

If a mission cell has no admin override for the next period:

- the generator falls back to random BTS-family catalog selection at reset time

If a mission cell does have an override for the next period:

- the next reset uses the admin-selected targets and values

## UI Structure

The current mission console is organized around:

- a mission control summary at the top
- live period keys and next editable period keys
- catalog and job-health status cards
- separate `Daily planning` and `Weekly planning` sections
- one card per mission cell with:
  - `Live now` read-only state
  - `Next up` planner

The planner also renders local catalog thumbnails for tracks and albums so admins can verify selections visually instead of relying on text-only labels.

## Related Docs

- [`../missions/README.md`](../missions/README.md)
- [`../missions/admin-operations.md`](../missions/admin-operations.md)
- [`../missions/scoring-and-leaderboards.md`](../missions/scoring-and-leaderboards.md)
