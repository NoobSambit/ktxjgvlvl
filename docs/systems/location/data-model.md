# Location Data Model

## Collections

### `LocationState`

- `stateKey`
- `stateLabel`
- `normalizedLabel`
- `stateCode`
- `aliases`
- `centroidLat`
- `centroidLng`
- `mapFeatureId`

### `LocationPlace`

- `placeKey`
- `geonameId`
- `placeLabel`
- `normalizedName`
- `aliases`
- `stateKey`
- `stateLabel`
- `districtLabel`
- `latitude`
- `longitude`
- `population`
- `featureClass`
- `featureCode`

### `User.region`

Compatibility labels remain, but canonical keys are now the source of truth.

- `stateKey`
- `state`
- `cityKey`
- `city`
- `cityConfirmedAt`
- `citySource`
- `fallbackCityKey`
- `fallbackCityLabel`
- `fallbackStateKey`
- `fallbackConfidence`
- `fallbackDetectedAt`
- `locationNeedsReview`
- `confirmedAt`
- `source`

### `StreamEvent`

Location attribution fields used by scoring and map snapshots:

- `stateKey`
- `stateLabel`
- `placeKey`
- `placeLabel`

### `LocationActivityEvent`

Write model for state and place activity:

- `period`
- `periodKey`
- `scopeType`
- `scopeKey`
- `stateKey`
- `placeKey`
- `displayLabel`
- `points`
- `sourceType`
- `sourceId`
- `userId`
- `occurredAt`
- `dedupeKey`

### `LocationActivitySnapshot`

Materialized read model for map rendering:

- `period`
- `periodKey`
- `scopeType`
- `scopeKey`
- `stateKey`
- `placeKey`
- `displayLabel`
- `activityScore`
- `verifiedStreamCount`
- `missionCompletionPoints`
- `missionCompletionCount`
- `activeUserCount`
- `lastOccurredAt`
- `isDirty`

## Source of Truth Notes

- State scoring uses `region.stateKey`, not free-text labels.
- Confirmed city uses `region.cityKey`.
- Unconfirmed fallback city uses `region.fallbackCityKey`.
- Historical display fields are preserved to avoid breaking older UI and documents during rollout.
