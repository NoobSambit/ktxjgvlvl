# Activity Map

The India activity map is a state choropleth with city hotspot markers.

## Rendering Stack

- `react-simple-maps`
- `d3-geo`
- `d3-scale`
- vendored geoBoundaries ADM1 TopoJSON

Primary files:

- `src/components/activity-map/activity-map-panel.tsx`
- `src/modules/activity-map/service.ts`
- `src/app/api/v1/activity-map/route.ts`

## Scoring Rules

### State layer

- `1 verified BTS-family stream = 1 point`
- mission completion adds its reward points
- state layer uses the same point logic as the live state leaderboard

### Place layer

- verified stream points count only when a resolved place exists
- personal mission rewards count when a resolved place exists
- India shared contributor rewards count when a resolved place exists
- state-shared mission rewards stay state-only

## Materialization

- write model:
  - `LocationActivityEvent`
- read model:
  - `LocationActivitySnapshot`
- cron/job key:
  - `materialize-location-activity`
- internal route:
  - `src/app/api/internal/cron/materialize-location-activity/route.ts`

## UI Surfaces

- Landing page:
  - weekly default
  - concise tooltip/details panel
- Dashboard:
  - daily/weekly toggle
  - richer details panel with streams, mission points, and active users

## Attribution

- Boundaries: geoBoundaries gbOpen
- Locality registry: GeoNames
