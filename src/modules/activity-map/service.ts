import { Types } from "mongoose"
import { unstable_cache } from "next/cache"
import { cacheTags, revalidateCacheTags, sharedCacheRevalidateSeconds } from "@/platform/cache/shared"
import {
  LocationActivityEventModel,
  LocationActivitySnapshotModel
} from "@/platform/db/models/activity-map"
import { LocationPlaceModel, LocationStateModel } from "@/platform/db/models/locations"
import { connectToDatabase } from "@/platform/db/mongoose"
import { buildStateKey, slugifyScope } from "@/platform/integrations/geo/state-scopes"
import { getIndiaPeriod, type MissionCadence } from "@/platform/time/india-periods"
import indiaAdm1StateMetadata from "@/data/geo/india-adm1-state-metadata.json"
import { indiaStateRegistry } from "@/modules/locations/india-registry"
import type {
  ActivityMapHotspotEntry,
  ActivityMapStateEntry,
  ActivityMapView
} from "@/modules/activity-map/types"

type ActivityEventInput = {
  period: MissionCadence
  periodKey: string
  scopeType: "state" | "place"
  scopeKey: string
  stateKey: string
  placeKey?: string
  displayLabel: string
  points: number
  sourceType: "verified_stream" | "mission_completion"
  sourceId: string
  userId?: Types.ObjectId
  occurredAt: Date
  dedupeKey: string
}

type AggregatedSnapshot = {
  scopeType: "state" | "place"
  scopeKey: string
  stateKey: string
  placeKey?: string
  displayLabel: string
  activityScore: number
  verifiedStreamCount: number
  missionCompletionPoints: number
  missionCompletionCount: number
  activeUserCount: number
  lastOccurredAt?: Date
}

type ActivityMapStateDoc = {
  stateKey: string
  stateLabel: string
  stateCode: string
  centroidLat?: number
  centroidLng?: number
}

type ActivityMapSnapshotDoc = {
  _id: Types.ObjectId
  period: MissionCadence
  periodKey: string
  scopeType: "state" | "place"
  scopeKey: string
  stateKey: string
  placeKey?: string
  displayLabel: string
  activityScore: number
  verifiedStreamCount: number
  missionCompletionPoints: number
  missionCompletionCount: number
  activeUserCount: number
  updatedAt?: Date
}

const indiaAdm1MetadataByStateKey = new Map(
  indiaAdm1StateMetadata.map((entry) => [entry.stateKey, entry] as const)
)

function buildPlaceScopeKey(placeKey: string) {
  return `place:${slugifyScope(placeKey)}`
}

export function buildLocationActivityEvents(input: {
  occurredAt: Date
  points: number
  sourceType: "verified_stream" | "mission_completion"
  sourceId: string
  userId?: Types.ObjectId
  stateKey: string
  stateLabel: string
  placeKey?: string
  placeLabel?: string
}) {
  const daily = getIndiaPeriod("daily", input.occurredAt)
  const weekly = getIndiaPeriod("weekly", input.occurredAt)
  const periods = [daily, weekly] as const
  const stateScopeKey = buildStateKey(input.stateKey)
  const events: ActivityEventInput[] = []

  for (const period of periods) {
    events.push({
      period: period.cadence,
      periodKey: period.periodKey,
      scopeType: "state",
      scopeKey: stateScopeKey,
      stateKey: input.stateKey,
      displayLabel: input.stateLabel,
      points: input.points,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      userId: input.userId,
      occurredAt: input.occurredAt,
      dedupeKey: `activity:${input.sourceType}:${input.sourceId}:state:${period.periodKey}`
    })

    if (input.placeKey && input.placeLabel) {
      events.push({
        period: period.cadence,
        periodKey: period.periodKey,
        scopeType: "place",
        scopeKey: buildPlaceScopeKey(input.placeKey),
        stateKey: input.stateKey,
        placeKey: input.placeKey,
        displayLabel: input.placeLabel,
        points: input.points,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        userId: input.userId,
        occurredAt: input.occurredAt,
        dedupeKey: `activity:${input.sourceType}:${input.sourceId}:place:${input.placeKey}:${period.periodKey}`
      })
    }
  }

  return events
}

export async function recordLocationActivityEvents(events: ActivityEventInput[]) {
  await connectToDatabase()

  const filtered = events.filter(
    (event) => event.points > 0 && event.displayLabel.trim().length > 0 && event.stateKey.trim().length > 0
  )

  if (filtered.length === 0) {
    return { inserted: 0 }
  }

  const eventOperations: Parameters<typeof LocationActivityEventModel.bulkWrite>[0] = filtered.map(
    (event) => ({
      updateOne: {
        filter: { dedupeKey: event.dedupeKey },
        update: {
          $setOnInsert: {
            period: event.period,
            periodKey: event.periodKey,
            scopeType: event.scopeType,
            scopeKey: event.scopeKey,
            stateKey: event.stateKey,
            placeKey: event.placeKey,
            displayLabel: event.displayLabel,
            points: event.points,
            sourceType: event.sourceType,
            sourceId: event.sourceId,
            userId: event.userId,
            occurredAt: event.occurredAt,
            dedupeKey: event.dedupeKey
          }
        },
        upsert: true
      }
    })
  )
  const result = await LocationActivityEventModel.bulkWrite(eventOperations, { ordered: false })
  const inserted = result.upsertedCount ?? 0

  if (inserted > 0) {
    const snapshotOps = new Map<string, (typeof filtered)[number]>()

    for (const event of filtered) {
      snapshotOps.set(
        `${event.period}:${event.periodKey}:${event.scopeType}:${event.scopeKey}`,
        event
      )
    }

    await LocationActivitySnapshotModel.bulkWrite(
      Array.from(snapshotOps.values(), (event) => ({
        updateOne: {
          filter: {
            period: event.period,
            periodKey: event.periodKey,
            scopeType: event.scopeType,
            scopeKey: event.scopeKey
          },
          update: {
            $setOnInsert: {
              stateKey: event.stateKey,
              placeKey: event.placeKey,
              displayLabel: event.displayLabel,
              activityScore: 0,
              verifiedStreamCount: 0,
              missionCompletionPoints: 0,
              missionCompletionCount: 0,
              activeUserCount: 0
            },
            $set: {
              isDirty: true
            }
          },
          upsert: true
        }
      })),
      { ordered: false }
    )

    revalidateCacheTags(
      cacheTags.activityMap,
      cacheTags.activityMapDaily,
      cacheTags.activityMapWeekly,
      cacheTags.activityMapAdmin,
      cacheTags.adminOverview
    )
  }

  return { inserted }
}

function aggregateEvents(
  events: Array<{
    scopeType: "state" | "place"
    scopeKey: string
    stateKey: string
    placeKey?: string
    displayLabel: string
    points: number
    sourceType: "verified_stream" | "mission_completion"
    userId?: Types.ObjectId
    occurredAt: Date
  }>
) {
  const aggregateMap = new Map<string, AggregatedSnapshot>()
  const userSets = new Map<string, Set<string>>()

  for (const event of events) {
    const current = aggregateMap.get(event.scopeKey) ?? {
      scopeType: event.scopeType,
      scopeKey: event.scopeKey,
      stateKey: event.stateKey,
      placeKey: event.placeKey,
      displayLabel: event.displayLabel,
      activityScore: 0,
      verifiedStreamCount: 0,
      missionCompletionPoints: 0,
      missionCompletionCount: 0,
      activeUserCount: 0,
      lastOccurredAt: event.occurredAt
    }

    current.activityScore += event.points
    current.lastOccurredAt =
      current.lastOccurredAt && current.lastOccurredAt > event.occurredAt
        ? current.lastOccurredAt
        : event.occurredAt

    if (event.sourceType === "verified_stream") {
      current.verifiedStreamCount += 1
    } else {
      current.missionCompletionPoints += event.points
      current.missionCompletionCount += 1
    }

    if (event.userId) {
      const userSet = userSets.get(event.scopeKey) ?? new Set<string>()
      userSet.add(String(event.userId))
      userSets.set(event.scopeKey, userSet)
      current.activeUserCount = userSet.size
    }

    aggregateMap.set(event.scopeKey, current)
  }

  return Array.from(aggregateMap.values())
}

export async function materializeLocationActivity(options: { periodKey?: string } = {}) {
  await connectToDatabase()

  const filter: Record<string, unknown> = {}

  if (options.periodKey) {
    filter.periodKey = options.periodKey
  }

  const dirtySnapshots = await LocationActivitySnapshotModel.find({
    ...filter,
    isDirty: true
  }).lean()

  const groupedByPeriod = new Map<string, typeof dirtySnapshots>()

  for (const snapshot of dirtySnapshots) {
    const key = `${snapshot.period}:${snapshot.periodKey}`
    const group = groupedByPeriod.get(key) ?? []
    group.push(snapshot)
    groupedByPeriod.set(key, group)
  }

  for (const [key, snapshots] of groupedByPeriod.entries()) {
    const [period, periodKey] = key.split(":") as [MissionCadence, string]
    const scopeKeys = snapshots.map((snapshot) => snapshot.scopeKey)
    const events = await LocationActivityEventModel.find({
      period,
      periodKey,
      scopeKey: { $in: scopeKeys }
    })
      .sort({ occurredAt: 1, createdAt: 1, _id: 1 })
      .lean()

    const aggregates = aggregateEvents(
      events.map((event) => ({
        scopeType: event.scopeType as "state" | "place",
        scopeKey: event.scopeKey,
        stateKey: event.stateKey,
        placeKey: event.placeKey,
        displayLabel: event.displayLabel,
        points: event.points,
        sourceType: event.sourceType as "verified_stream" | "mission_completion",
        userId: event.userId as Types.ObjectId | undefined,
        occurredAt: event.occurredAt
      }))
    )
    const aggregateMap = new Map(aggregates.map((aggregate) => [aggregate.scopeKey, aggregate] as const))

    for (const snapshot of snapshots) {
      const aggregate = aggregateMap.get(snapshot.scopeKey)

      await LocationActivitySnapshotModel.updateOne(
        { _id: snapshot._id },
        {
          $set: {
            stateKey: aggregate?.stateKey ?? snapshot.stateKey,
            placeKey: aggregate?.placeKey ?? snapshot.placeKey,
            displayLabel: aggregate?.displayLabel ?? snapshot.displayLabel,
            activityScore: aggregate?.activityScore ?? 0,
            verifiedStreamCount: aggregate?.verifiedStreamCount ?? 0,
            missionCompletionPoints: aggregate?.missionCompletionPoints ?? 0,
            missionCompletionCount: aggregate?.missionCompletionCount ?? 0,
            activeUserCount: aggregate?.activeUserCount ?? 0,
            lastOccurredAt: aggregate?.lastOccurredAt,
            isDirty: false
          }
        }
      )
    }
  }

  return {
    snapshotsMaterialized: dirtySnapshots.length
  }
}

async function ensureCurrentPeriodMaterialized(period: MissionCadence) {
  const currentPeriod = getIndiaPeriod(period)
  await materializeLocationActivity({ periodKey: currentPeriod.periodKey })
  return currentPeriod
}

async function buildActivityMapView(period: MissionCadence): Promise<ActivityMapView> {
  await connectToDatabase()

  const currentPeriod = await ensureCurrentPeriodMaterialized(period)
  const [stateDocs, snapshots] = await Promise.all([
    LocationStateModel.find({})
      .sort({ stateLabel: 1 })
      .select({
        stateKey: 1,
        stateLabel: 1,
        stateCode: 1,
        centroidLat: 1,
        centroidLng: 1
      })
      .lean() as unknown as Promise<ActivityMapStateDoc[]>,
    LocationActivitySnapshotModel.find({
      period: currentPeriod.cadence,
      periodKey: currentPeriod.periodKey
    }).lean() as unknown as Promise<ActivityMapSnapshotDoc[]>
  ])
  const states =
    stateDocs.length > 0
      ? stateDocs
      : indiaStateRegistry
          .map((state) => ({
            stateKey: state.stateKey,
            stateLabel: state.stateLabel,
            stateCode: state.stateCode,
            centroidLat: indiaAdm1MetadataByStateKey.get(state.stateKey)?.centroidLat,
            centroidLng: indiaAdm1MetadataByStateKey.get(state.stateKey)?.centroidLng
          }))
          .sort((left, right) => left.stateLabel.localeCompare(right.stateLabel))

  const stateSnapshotMap = new Map(
    snapshots
      .filter((snapshot) => snapshot.scopeType === "state")
      .map((snapshot) => [snapshot.stateKey, snapshot] as const)
  )
  const placeSnapshots = snapshots
    .filter((snapshot) => snapshot.scopeType === "place" && snapshot.placeKey)
    .sort((left, right) => {
      if (right.activityScore !== left.activityScore) {
        return right.activityScore - left.activityScore
      }

      return left.displayLabel.localeCompare(right.displayLabel)
    })
  const topPlaceSnapshots = placeSnapshots.slice(0, period === "daily" ? 15 : 12)
  const placeMap = new Map(
    (
      await LocationPlaceModel.find({
        placeKey: { $in: topPlaceSnapshots.map((snapshot) => snapshot.placeKey) }
      })
        .select({
          placeKey: 1,
          placeLabel: 1,
          stateKey: 1,
          stateLabel: 1,
          latitude: 1,
          longitude: 1
        })
        .lean()
    ).map((place) => [place.placeKey, place] as const)
  )

  const stateEntries: ActivityMapStateEntry[] = states.map((state) => {
    const snapshot = stateSnapshotMap.get(state.stateKey)

    return {
      stateKey: state.stateKey,
      stateLabel: state.stateLabel,
      stateCode: state.stateCode,
      activityScore: snapshot?.activityScore ?? 0,
      verifiedStreamCount: snapshot?.verifiedStreamCount ?? 0,
      missionCompletionPoints: snapshot?.missionCompletionPoints ?? 0,
      missionCompletionCount: snapshot?.missionCompletionCount ?? 0,
      activeUserCount: snapshot?.activeUserCount ?? 0,
      centroidLat: state.centroidLat,
      centroidLng: state.centroidLng
    }
  })

  const hotspotEntries: ActivityMapHotspotEntry[] = topPlaceSnapshots
    .map((snapshot) => {
      const place = snapshot.placeKey ? placeMap.get(snapshot.placeKey) : undefined

      if (!place) {
        return null
      }

      return {
        placeKey: place.placeKey,
        placeLabel: place.placeLabel,
        stateKey: place.stateKey,
        stateLabel: place.stateLabel,
        activityScore: snapshot.activityScore,
        verifiedStreamCount: snapshot.verifiedStreamCount,
        missionCompletionPoints: snapshot.missionCompletionPoints,
        missionCompletionCount: snapshot.missionCompletionCount,
        activeUserCount: snapshot.activeUserCount,
        latitude: place.latitude,
        longitude: place.longitude
      }
    })
    .filter((entry): entry is ActivityMapHotspotEntry => Boolean(entry))

  const topStates = [...stateEntries]
    .sort((left, right) => {
      if (right.activityScore !== left.activityScore) {
        return right.activityScore - left.activityScore
      }

      return left.stateLabel.localeCompare(right.stateLabel)
    })
    .slice(0, 5)

  const maxStateActivityScore = stateEntries.reduce(
    (maxValue, entry) => Math.max(maxValue, entry.activityScore),
    0
  )
  const maxHotspotActivityScore = hotspotEntries.reduce(
    (maxValue, entry) => Math.max(maxValue, entry.activityScore),
    0
  )
  const lastMaterializedAt = snapshots
    .map((snapshot) => snapshot.updatedAt as Date | undefined)
    .filter((value): value is Date => Boolean(value))
    .sort((left, right) => right.getTime() - left.getTime())[0]

  return {
    period,
    periodKey: currentPeriod.periodKey,
    states: stateEntries,
    hotspots: hotspotEntries,
    topStates,
    maxStateActivityScore,
    maxHotspotActivityScore,
    lastMaterializedAt: lastMaterializedAt?.toISOString()
  }
}

const getDailyActivityMapViewCached = unstable_cache(async () => buildActivityMapView("daily"), ["activity-map:view:daily:v1"], {
  revalidate: sharedCacheRevalidateSeconds,
  tags: [cacheTags.activityMap, cacheTags.activityMapDaily]
})

const getWeeklyActivityMapViewCached = unstable_cache(async () => buildActivityMapView("weekly"), ["activity-map:view:weekly:v1"], {
  revalidate: sharedCacheRevalidateSeconds,
  tags: [cacheTags.activityMap, cacheTags.activityMapWeekly]
})

export async function getActivityMapView(period: MissionCadence): Promise<ActivityMapView> {
  return period === "daily" ? getDailyActivityMapViewCached() : getWeeklyActivityMapViewCached()
}

const getActivityMapAdminSummaryCached = unstable_cache(async () => {
  await connectToDatabase()

  const [eventCount, snapshotCount, latestSnapshot] = await Promise.all([
    LocationActivityEventModel.countDocuments(),
    LocationActivitySnapshotModel.countDocuments(),
    LocationActivitySnapshotModel.findOne()
      .sort({ updatedAt: -1 })
      .select({ updatedAt: 1 })
      .lean() as Promise<{ updatedAt?: Date } | null>
  ])

  return {
    eventCount,
    snapshotCount,
    lastMaterializedAt: latestSnapshot?.updatedAt?.toISOString()
  }
}, ["activity-map:admin-summary:v1"], {
  revalidate: sharedCacheRevalidateSeconds,
  tags: [cacheTags.activityMapAdmin, cacheTags.activityMap, cacheTags.adminOverview]
})

export async function getActivityMapAdminSummary() {
  return getActivityMapAdminSummaryCached()
}
