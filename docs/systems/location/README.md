# Location System

This document covers the canonical India location registry, signup/profile location rules, and IP fallback behavior.

## Product Rules

- `state` is mandatory for account creation and all scoring.
- `city / town` is optional and never blocks signup, mission verification, or leaderboard credit.
- State leaderboards trust only `region.stateKey`.
- City is used only for hotspot attribution on the India activity map in this pass.
- If IP geolocation finds a city in a different state than the user-confirmed state, the city is not stored.

## Runtime Surfaces

- Signup:
  - `src/components/auth/sign-up-form.tsx`
  - `src/app/api/v1/auth/signup/route.ts`
- Profile editing:
  - `src/app/(app)/profile/page.tsx`
  - `src/components/profile/profile-location-form.tsx`
  - `src/app/api/v1/profile/location/route.ts`
- Registry/search APIs:
  - `src/app/api/v1/locations/states/route.ts`
  - `src/app/api/v1/locations/places/route.ts`
  - `src/app/api/v1/locations/suggestion/route.ts`
- Core service:
  - `src/modules/locations/service.ts`

## Canonical Data Sources

- India ADM1 boundaries:
  - vendored TopoJSON in `src/data/geo/india-adm1.topo.json`
  - normalized metadata in `src/data/geo/india-adm1-state-metadata.json`
- Canonical states and UTs:
  - `src/modules/locations/india-registry.ts`
- Offline locality import:
  - `scripts/import-india-locations.mjs`

## Import and Backfill

- Normalize TopoJSON metadata:
  - `npm run normalize:india-topojson`
- Import states and GeoNames populated places:
  - `npm run import:india-locations`
- Backfill legacy users to canonical keys:
  - `npm run backfill:user-location-keys`

Run order:

1. Normalize vendored ADM1 geometry.
2. Import location registry data.
3. Backfill legacy users.

## IP Suggestion Behavior

- Hosting headers are checked first:
  - `x-vercel-ip-country`
  - `x-vercel-ip-country-region`
  - `x-vercel-ip-city`
- `ipapi.co` is the server-side fallback provider.
- Only the matched fallback state/city fields are stored.
- Raw IP addresses are never persisted on the user record.
